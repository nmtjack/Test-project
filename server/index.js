/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4000);
const upload = multer({ dest: path.join(process.cwd(), "uploads") });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

function money(value) {
  return new Prisma.Decimal(value ?? 0);
}

function bookingCode() {
  return `BK-${Date.now().toString().slice(-7)}`;
}

function orderCode() {
  return `ORD-${Date.now().toString().slice(-7)}`;
}

function billCode() {
  return `BILL-${Date.now().toString().slice(-7)}`;
}

function detailedRoomInclude() {
  return {
    amenities: true,
    images: { orderBy: [{ isCover: "desc" }, { createdAt: "desc" }] },
    blockedDates: { orderBy: { startDate: "asc" } },
    housekeepingLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    bookings: {
      include: { guest: true },
      orderBy: { checkIn: "asc" },
    },
  };
}

function nights(checkIn, checkOut) {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

async function orderWithTotal(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  const total = order.items.reduce((sum, item) => sum.plus(item.unitPrice.mul(item.quantity)), new Prisma.Decimal(0));
  return prisma.order.update({
    where: { id: orderId },
    data: { total },
    include: {
      table: true,
      booking: { include: { guest: true, room: true } },
      items: { include: { menuItem: true } },
    },
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/rooms", async (_req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      include: { amenities: true, images: true, blockedDates: true },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

app.get("/rooms/:id", async (req, res, next) => {
  try {
    const room = await prisma.room.findUniqueOrThrow({
      where: { id: req.params.id },
      include: detailedRoomInclude(),
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
});

app.post("/rooms", async (req, res, next) => {
  try {
    const room = await prisma.room.create({
      data: {
        number: req.body.number,
        name: req.body.name ?? "",
        type: req.body.type,
        roomType: req.body.roomType,
        floor: Number(req.body.floor),
        maxAdults: Number(req.body.maxAdults ?? 2),
        maxChildren: Number(req.body.maxChildren ?? 0),
        basePrice: money(req.body.basePrice),
        weekendPrice: req.body.weekendPrice === undefined ? undefined : money(req.body.weekendPrice),
        bedType: req.body.bedType,
        sizeSqm: req.body.sizeSqm === undefined ? undefined : Number(req.body.sizeSqm),
        description: req.body.description ?? "",
        status: req.body.status ?? "AVAILABLE",
        isActive: req.body.isActive ?? true,
        wifiPassword: req.body.wifiPassword ?? "",
        amenities: {
          create: (req.body.amenities ?? []).map((name) => ({ name, isCustom: false })),
        },
      },
      include: detailedRoomInclude(),
    });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

app.patch("/rooms/:id", async (req, res, next) => {
  try {
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        number: req.body.number,
        name: req.body.name,
        type: req.body.type,
        roomType: req.body.roomType,
        floor: req.body.floor === undefined ? undefined : Number(req.body.floor),
        maxAdults: req.body.maxAdults === undefined ? undefined : Number(req.body.maxAdults),
        maxChildren: req.body.maxChildren === undefined ? undefined : Number(req.body.maxChildren),
        basePrice: req.body.basePrice === undefined ? undefined : money(req.body.basePrice),
        weekendPrice: req.body.weekendPrice === undefined ? undefined : money(req.body.weekendPrice),
        bedType: req.body.bedType,
        sizeSqm: req.body.sizeSqm === undefined ? undefined : Number(req.body.sizeSqm),
        description: req.body.description,
        status: req.body.status,
        isActive: req.body.isActive,
        wifiPassword: req.body.wifiPassword,
        housekeepingNote: req.body.housekeepingNote,
      },
      include: detailedRoomInclude(),
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
});

app.post("/rooms/:id/amenities", async (req, res, next) => {
  try {
    const amenity = await prisma.roomAmenity.create({
      data: {
        roomId: req.params.id,
        name: req.body.name,
        isCustom: Boolean(req.body.isCustom ?? true),
      },
    });
    res.status(201).json(amenity);
  } catch (error) {
    next(error);
  }
});

app.post("/rooms/:id/images", upload.array("images", 10), async (req, res, next) => {
  try {
    const files = req.files ?? [];
    const images = await Promise.all(
      files.map((file, index) =>
        prisma.roomImage.create({
          data: {
            roomId: req.params.id,
            path: `/uploads/${file.filename}`,
            alt: req.body.alt ?? file.originalname,
            isCover: req.body.coverIndex !== undefined && Number(req.body.coverIndex) === index,
          },
        }),
      ),
    );
    res.status(201).json(images);
  } catch (error) {
    next(error);
  }
});

app.patch("/rooms/:id/images/:imageId/cover", async (req, res, next) => {
  try {
    await prisma.roomImage.updateMany({ where: { roomId: req.params.id }, data: { isCover: false } });
    const image = await prisma.roomImage.update({ where: { id: req.params.imageId }, data: { isCover: true } });
    res.json(image);
  } catch (error) {
    next(error);
  }
});

app.post("/rooms/:id/block-dates", async (req, res, next) => {
  try {
    const block = await prisma.blockedDate.create({
      data: {
        roomId: req.params.id,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        reason: req.body.reason,
      },
    });
    res.status(201).json(block);
  } catch (error) {
    next(error);
  }
});

app.delete("/rooms/:id/block-dates/:blockId", async (req, res, next) => {
  try {
    await prisma.blockedDate.delete({ where: { id: req.params.blockId } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/availability", async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
        status: { notIn: ["MAINTENANCE", "BLOCKED"] },
        bookings: {
          none: {
            status: { in: ["UPCOMING", "ACTIVE"] },
            checkIn: { lt: new Date(String(checkOut)) },
            checkOut: { gt: new Date(String(checkIn)) },
          },
        },
        blockedDates: {
          none: {
            startDate: { lt: new Date(String(checkOut)) },
            endDate: { gt: new Date(String(checkIn)) },
          },
        },
      },
      include: { amenities: true, images: true },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

app.get("/guests/search", async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "");
    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          { phone: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { bookings: { include: { room: true }, orderBy: { checkIn: "desc" } } },
      take: 10,
    });
    res.json(guests);
  } catch (error) {
    next(error);
  }
});

app.delete("/rooms/:id", async (req, res, next) => {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/bookings", async (req, res, next) => {
  try {
    const { from, to, status } = req.query;
    const bookings = await prisma.booking.findMany({
      where: {
        status: status ? String(status).toUpperCase().replace("-", "_") : undefined,
        checkIn: from ? { gte: new Date(String(from)) } : undefined,
        checkOut: to ? { lte: new Date(String(to)) } : undefined,
      },
      include: { guest: true, room: true },
      orderBy: { checkIn: "asc" },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

app.post("/bookings", async (req, res, next) => {
  try {
    const { guestName, phone, email, checkIn, checkOut, roomId } = req.body;
    const room = await prisma.room.findUniqueOrThrow({
      where: { id: roomId },
      include: { blockedDates: true },
    });

    if (!room.isActive || ["MAINTENANCE", "BLOCKED"].includes(room.status)) {
      return res.status(409).json({ error: "Cannot book an inactive, maintenance, or blocked room." });
    }

    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ["UPCOMING", "ACTIVE"] },
        checkIn: { lt: new Date(checkOut) },
        checkOut: { gt: new Date(checkIn) },
      },
    });

    const blocked = room.blockedDates.some(
      (block) => block.startDate < new Date(checkOut) && block.endDate > new Date(checkIn),
    );

    if (overlap || blocked) {
      return res.status(409).json({ error: "Room is unavailable for those dates." });
    }

    const totalNights = nights(checkIn, checkOut);
    const rate = req.body.roomRate ?? room.basePrice;
    const booking = await prisma.booking.create({
      data: {
        bookingId: req.body.bookingId ?? bookingCode(),
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults: Number(req.body.adults ?? 1),
        children: Number(req.body.children ?? 0),
        source: req.body.source ?? "WALK_IN",
        otaReference: req.body.otaReference,
        roomRateSnapshot: money(rate),
        totalNights,
        estimatedTotal: money(rate).mul(totalNights),
        depositAmount: money(req.body.depositAmount ?? 0),
        depositMethod: req.body.depositMethod,
        depositStatus: req.body.depositStatus ?? "UNPAID",
        internalNotes: req.body.internalNotes ?? "",
        room: { connect: { id: roomId } },
        guest: req.body.guestId
          ? { connect: { id: req.body.guestId } }
          : {
              create: {
                name: guestName,
                phone,
                email,
                nationality: req.body.nationality,
                idType: req.body.idType,
                idNumber: req.body.idNumber,
                dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
                notes: req.body.guestNotes ?? "",
                specialRequests: req.body.specialRequests ?? "",
              },
            },
      },
      include: { guest: true, room: true },
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

app.patch("/bookings/:id/checkin", async (req, res, next) => {
  try {
    if (req.body.roomReady === false) {
      return res.status(409).json({ error: "Room must be inspected and ready before check-in." });
    }
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: "ACTIVE",
        depositAmount: req.body.depositAmount === undefined ? undefined : money(req.body.depositAmount),
        depositMethod: req.body.depositMethod,
        depositStatus: req.body.depositStatus,
        room: { update: { status: "OCCUPIED" } },
      },
      include: { guest: true, room: true },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

app.patch("/bookings/:id/checkout", async (req, res, next) => {
  try {
    if (req.body.paymentConfirmed === false) {
      return res.status(409).json({ error: "Payment must be confirmed before check-out." });
    }
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: "CHECKED_OUT",
        room: { update: { status: "DIRTY" } },
      },
      include: { guest: true, room: true },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

app.get("/housekeeping", async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const rooms = await prisma.room.findMany({
      where: status && status !== "ALL" ? { status } : undefined,
      include: { housekeepingLogs: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

app.patch("/housekeeping/rooms/:id/status", async (req, res, next) => {
  try {
    const current = await prisma.room.findUniqueOrThrow({ where: { id: req.params.id } });
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
        housekeepingNote: req.body.note ?? current.housekeepingNote,
        housekeepingLogs: {
          create: {
            fromStatus: current.status,
            toStatus: req.body.status,
            note: req.body.note ?? "",
            changedBy: req.body.changedBy ?? "Housekeeping",
          },
        },
      },
      include: { housekeepingLogs: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
});

app.get("/reports/rooms", async (req, res, next) => {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date();
    const to = req.query.to ? new Date(String(req.query.to)) : new Date(from.getTime() + 30 * 86_400_000);
    const [roomCount, bookings, guests] = await Promise.all([
      prisma.room.count({ where: { isActive: true } }),
      prisma.booking.findMany({
        where: {
          checkIn: { lt: to },
          checkOut: { gt: from },
          status: { in: ["UPCOMING", "ACTIVE", "CHECKED_OUT"] },
        },
        include: { guest: true, room: true },
      }),
      prisma.guest.findMany({ include: { bookings: true } }),
    ]);
    const rangeNights = Math.max(1, nights(from, to));
    const occupiedNights = bookings.reduce((sum, booking) => sum + nights(booking.checkIn, booking.checkOut), 0);
    const revenue = bookings.reduce((sum, booking) => sum.plus(booking.estimatedTotal), new Prisma.Decimal(0));
    const bySource = bookings.reduce((acc, booking) => {
      acc[booking.source] = (acc[booking.source] ?? 0) + 1;
      return acc;
    }, {});
    res.json({
      occupancyRate: roomCount ? Math.round((occupiedNights / (roomCount * rangeNights)) * 100) : 0,
      revenue,
      bookingSourceBreakdown: bySource,
      topGuests: guests
        .map((guest) => ({ id: guest.id, name: guest.name, stays: guest.bookings.length }))
        .sort((a, b) => b.stays - a.stays)
        .slice(0, 10),
      roomPerformance: bookings.reduce((acc, booking) => {
        acc[booking.room.number] = (acc[booking.room.number] ?? 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/tables", async (_req, res, next) => {
  try {
    const tables = await prisma.restaurantTable.findMany({ orderBy: { number: "asc" } });
    res.json(tables);
  } catch (error) {
    next(error);
  }
});

app.get("/menu-items", async (_req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

app.post("/orders", async (req, res, next) => {
  try {
    const order = await prisma.order.create({
      data: {
        orderId: orderCode(),
        table: { connect: { id: req.body.tableId } },
        booking: req.body.bookingId ? { connect: { id: req.body.bookingId } } : undefined,
      },
      include: { table: true, booking: true, items: true },
    });
    await prisma.restaurantTable.update({ where: { id: req.body.tableId }, data: { status: "OCCUPIED" } });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

app.patch("/orders/:id/items", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.status !== "OPEN") {
      return res.status(409).json({ error: "Order items can only be changed while the order is open." });
    }

    for (const item of req.body.items ?? []) {
      const menuItem = await prisma.menuItem.findUniqueOrThrow({ where: { id: item.menuItemId } });
      if (Number(item.quantity) <= 0) {
        await prisma.orderItem.deleteMany({ where: { orderId: order.id, menuItemId: item.menuItemId } });
      } else {
        await prisma.orderItem.upsert({
          where: { orderId_menuItemId: { orderId: order.id, menuItemId: item.menuItemId } },
          create: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: Number(item.quantity),
            unitPrice: menuItem.price,
          },
          update: {
            quantity: Number(item.quantity),
            unitPrice: menuItem.price,
          },
        });
      }
    }

    res.json(await orderWithTotal(order.id));
  } catch (error) {
    next(error);
  }
});

app.patch("/orders/:id/send-kitchen", async (req, res, next) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: "SENT_TO_KITCHEN",
        items: { updateMany: { where: {}, data: { locked: true } } },
      },
      include: { table: true, items: { include: { menuItem: true } } },
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

app.patch("/orders/:id/close", async (req, res, next) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "CLOSED" },
      include: { table: true, booking: true, items: { include: { menuItem: true } } },
    });
    await prisma.restaurantTable.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } });

    const total = order.items.reduce((sum, item) => sum.plus(item.unitPrice.mul(item.quantity)), new Prisma.Decimal(0));
    const bill = await prisma.bill.create({
      data: {
        billId: billCode(),
        guestId: order.booking?.guestId,
        bookingId: order.bookingId,
        subtotal: total,
        taxTotal: new Prisma.Decimal(0),
        grandTotal: total,
        lineItems: {
          create: {
            description: `Restaurant order ${order.orderId} - table ${order.table.number}`,
            quantity: 1,
            unitPrice: total,
            total,
            source: "POS",
          },
        },
        orderLinks: { create: { orderId: order.id } },
      },
      include: { lineItems: true, payment: true },
    });

    res.json({ order, bill });
  } catch (error) {
    next(error);
  }
});

app.post("/bills", async (req, res, next) => {
  try {
    const taxRate = money(req.body.taxRate ?? 0);
    const lineItems = [];
    let guestId = req.body.guestId;

    if (req.body.bookingId) {
      const booking = await prisma.booking.findUniqueOrThrow({
        where: { id: req.body.bookingId },
        include: { guest: true, room: true },
      });
      guestId = guestId ?? booking.guestId;
      const roomNights = nights(booking.checkIn, booking.checkOut);
      lineItems.push({
        description: `Room ${booking.room.number} - ${roomNights} night${roomNights === 1 ? "" : "s"}`,
        quantity: roomNights,
        unitPrice: booking.room.basePrice,
        total: booking.room.basePrice.mul(roomNights),
        source: "ROOM",
      });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: req.body.orderIds ?? [] } },
      include: { items: { include: { menuItem: true } }, booking: true },
    });
    for (const order of orders) {
      guestId = guestId ?? order.booking?.guestId;
      const total = order.items.reduce((sum, item) => sum.plus(item.unitPrice.mul(item.quantity)), new Prisma.Decimal(0));
      lineItems.push({
        description: `Restaurant order ${order.orderId}`,
        quantity: 1,
        unitPrice: total,
        total,
        source: "POS",
      });
    }

    for (const item of req.body.manualLineItems ?? []) {
      const quantity = Number(item.quantity ?? 1);
      const unitPrice = money(item.unitPrice);
      lineItems.push({
        description: item.description,
        quantity,
        unitPrice,
        total: unitPrice.mul(quantity),
        source: "MANUAL",
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum.plus(item.total), new Prisma.Decimal(0));
    const taxTotal = subtotal.mul(taxRate).div(100);
    const grandTotal = subtotal.plus(taxTotal);

    const bill = await prisma.bill.create({
      data: {
        billId: billCode(),
        guestId,
        bookingId: req.body.bookingId,
        taxRate,
        subtotal,
        taxTotal,
        grandTotal,
        lineItems: { create: lineItems },
        orderLinks: { create: orders.map((order) => ({ orderId: order.id })) },
      },
      include: { guest: true, booking: true, lineItems: true, orderLinks: { include: { order: true } }, payment: true },
    });

    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
});

app.get("/bills", async (req, res, next) => {
  try {
    const { from, to, status } = req.query;
    const bills = await prisma.bill.findMany({
      where: {
        status: status ? String(status).toUpperCase() : undefined,
        createdAt: {
          gte: from ? new Date(String(from)) : undefined,
          lte: to ? new Date(String(to)) : undefined,
        },
      },
      include: { guest: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

app.get("/bills/:id", async (req, res, next) => {
  try {
    const bill = await prisma.bill.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        guest: true,
        booking: { include: { room: true } },
        lineItems: true,
        orderLinks: { include: { order: { include: { table: true, items: { include: { menuItem: true } } } } } },
        payment: true,
      },
    });
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

app.patch("/bills/:id/pay", async (req, res, next) => {
  try {
    const existingBill = await prisma.bill.findUniqueOrThrow({ where: { id: req.params.id } });
    const amount = req.body.amount ? money(req.body.amount) : existingBill.grandTotal;
    const bill = await prisma.bill.update({
      where: { id: req.params.id },
      data: {
        status: "PAID",
        payment: {
          upsert: {
            create: { amount, method: req.body.paymentMethod },
            update: { amount, method: req.body.paymentMethod },
          },
        },
      },
      include: { guest: true, lineItems: true, payment: true },
    });
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

// Express identifies error middleware by arity, so the unused fourth argument is intentional.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error, _req, res, nextHandler) => {
  console.error(error);
  res.status(error.code === "P2025" ? 404 : 500).json({ error: error.message ?? "Unexpected server error" });
});

app.listen(port, () => {
  console.log(`Hospitality API listening on http://127.0.0.1:${port}`);
});
