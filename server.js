const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));
const rooms = [
    {
        id: 1,
        name: "Single Room",
        price: 2500
    },
    {
        id: 2,
        name: "Double Room",
        price: 5000
    }
];
const hotels = [
    {
        id: 1,
        name: "Cosmic Queens Hotel",
        location: "Kiambu",
        phone: "0702123678",
        email: "cosmicqueenshotel@gmai l.com",
        website: "https://cosmicqueenshotel.com"
    }
];
const mealOrders = [];
const spaBookings = [];
const bookings = [];
app.post("/bookings", (req, res) => {
    const { customerName, phone, hotelId, roomId, checkIn, checkOut } = req.body;

    if (!customerName || !phone || !hotelId || !roomId || !checkIn || !checkOut) {
        return res.status(400).json({
            message: "All booking details are required"
        });
    }
    if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({
        message: "Phone number must be 10 digits"
    });
    }
    if (!/^[A-Za-z ]+$/.test(customerName)) {
    return res.status(400).json({
        message: "Customer name must contain letters only"
    });
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({
        message: "Check-out date must be after check-in date"
    });
    }
    if (isNaN(Number(hotelId))) {
    return res.status(400).json({
        message: "Hotel ID must be a number"
    });
    }

    if (isNaN(Number(roomId))) {
    return res.status(400).json({
        message: "Room ID must be a number"
    });
    }
    const hotel = hotels.find(hotel => hotel.id === Number(hotelId));
    if (!hotel) {
        return res.status(404).json({
            message: "Hotel not found"
        });
    }

    const room = rooms.find(room => room.id === Number(roomId));
    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }
    const nights =
    (new Date(checkOut) - new Date(checkIn)) /
    (1000 * 60 * 60 * 24);

    const totalPrice = room.price * nights;
    const existingBooking = bookings.find(booking =>
    booking.roomId === Number(roomId) &&
    booking.status !== "cancelled" &&
    new Date(checkIn) < new Date(booking.checkOut) &&
    new Date(checkOut) > new Date(booking.checkIn)
    );

    if (existingBooking) {
    return res.status(400).json({
        message: "Room is already booked for these dates"
    });
    }

    const newBooking = {
         id: bookings.length
             ? Math.max(...bookings.map(booking => booking.id)) + 1
             : 1,

        customerName,
        phone,
        hotelId: Number(hotelId),
        roomId: Number(roomId),
        checkIn,
        checkOut,
        nights,
        pricePerNight: room.price,
        totalPrice,
        status: "confirmed"
    };

    bookings.push(newBooking);

    res.json({
        message: "Booking created successfully",
        booking: newBooking
    });
});
app.get("/bookings", (req, res) => {
    res.json(bookings);
});
app.get("/bookings/:id", (req, res) => {
    const bookingId = Number(req.params.id);

    const booking = bookings.find(booking => booking.id === bookingId);

    if (!booking) {
        return res.status(404).json({
            message: "Booking not found"
        });
    }

    res.json(booking);
});
app.get("/bookings/status/:status", (req, res) => {
    const status = req.params.status.toLowerCase();

    const filteredBookings = bookings.filter(
        booking => booking.status === status
    );

    res.json(filteredBookings);
});
app.get("/bookings/customer/:name", (req, res) => {
    const name = req.params.name.toLowerCase();

    const customerBookings = bookings.filter(
        booking => booking.customerName.toLowerCase() === name
    );

    res.json(customerBookings);
});
app.get("/bookings/hotel/:hotelId", (req, res) => {
    const hotelId = Number(req.params.hotelId);

    const hotelBookings = bookings.filter(
        booking => booking.hotelId === hotelId
    );

    res.json(hotelBookings);
});
app.get("/bookings/room/:roomId", (req, res) => {
    const roomId = Number(req.params.roomId);

    const roomBookings = bookings.filter(
        booking => booking.roomId === roomId
    );

    res.json(roomBookings);
});
app.get("/rooms/:roomId/availability", (req, res) => {
    const roomId = Number(req.params.roomId);
    if (isNaN(roomId)) {
    return res.status(400).json({
        message: "Room ID must be a number"
    });
}

    const room = rooms.find(room => room.id === roomId);

if (!room) {
    return res.status(404).json({
        message: "Room not found"
    });
}const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
        return res.status(400).json({
            message: "Check-in and check-out dates are required"
        });
    }
    if (isNaN(new Date(checkIn)) || isNaN(new Date(checkOut))) {
    return res.status(400).json({
        message: "Invalid check-in or check-out date"
    });
}
    if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({
        message: "Check-out date must be after check-in date"
    });
    }

    const existingBooking = bookings.find(booking =>
        booking.roomId === roomId &&
        booking.status !== "cancelled" &&
        new Date(checkIn) < new Date(booking.checkOut) &&
        new Date(checkOut) > new Date(booking.checkIn)
    );

    if (existingBooking) {
        return res.json({
            available: false,
            message: "Room is not available for these dates"
        });
    }

    res.json({
        available: true,
        message: "Room is available for these dates"
    });
});
app.put("/bookings/:id", (req, res) => {
    const bookingId = Number(req.params.id);

    const booking = bookings.find(booking => booking.id === bookingId);

    if (!booking) {
        return res.status(404).json({
            message: "Booking not found"
        });
    }

    const { customerName, phone, hotelId, roomId, checkIn, checkOut } = req.body;

    if (!customerName || !phone || !hotelId || !roomId || !checkIn || !checkOut) {
        return res.status(400).json({
            message: "All booking details are required"
        });
    }
    if (isNaN(new Date(checkIn)) || isNaN(new Date(checkOut))) {
    return res.status(400).json({
        message: "Invalid check-in or check-out date"
    });
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({
        message: "Check-out date must be after check-in date"
    });
    }
    if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({
        message: "Phone number must be 10 digits"
    });
    }
    if (!/^[A-Za-z ]+$/.test(customerName)) {
    return res.status(400).json({
        message: "Customer name must contain letters only"
    });
    }
    if (isNaN(Number(hotelId))) {
    return res.status(400).json({
        message: "Hotel ID must be a number"
    });
    }

    const hotel = hotels.find(hotel => hotel.id === Number(hotelId));

    if (!hotel) {
    return res.status(404).json({
        message: "Hotel not found"
    });
    }
    if (isNaN(Number(roomId))) {
    return res.status(400).json({
        message: "Room ID must be a number"
    });
    }
    const room = rooms.find(room => room.id === Number(roomId));

    if (!room) {
    return res.status(404).json({
        message: "Room not found"
    });
    }

    const nights =
    (new Date(checkOut) - new Date(checkIn)) /
    (1000 * 60 * 60 * 24);
    const existingBooking = bookings.find(existing =>
         existing.id !== bookingId &&
         existing.roomId === Number(roomId) &&
         existing.status !== "cancelled" &&
         new Date(checkIn) < new Date(existing.checkOut) &&
         new Date(checkOut) > new Date(existing.checkIn)
    );

    if (existingBooking) {
       return res.status(400).json({
           message: "Room is already booked for these dates"
       });
    }

    const totalPrice = room.price * nights;

    booking.customerName = customerName;
    booking.phone = phone;
    booking.hotelId = Number(hotelId);
    booking.roomId = Number(roomId);
    booking.checkIn = checkIn;
    booking.checkOut = checkOut;
    booking.nights = nights;
    booking.pricePerNight = room.price;
    booking.totalPrice = totalPrice;

    res.json({
        message: "Booking updated successfully",
        booking
    });
});
app.delete("/bookings/:id", (req, res) => {
    const bookingId = Number(req.params.id);

    const bookingIndex = bookings.findIndex(
        booking => booking.id === bookingId
    );

    if (bookingIndex === -1) {
        return res.status(404).json({
            message: "Booking not found"
        });
    }

    const deletedBooking = bookings.splice(bookingIndex, 1);

    res.json({
        message: "Booking deleted successfully",
        booking: deletedBooking[0]
    });
});
app.patch("/bookings/:id/cancel", (req, res) => {
    const bookingId = Number(req.params.id);

    const booking = bookings.find(booking => booking.id === bookingId);

    if (!booking) {
        return res.status(404).json({
            message: "Booking not found"
        });
    }
    if (booking.status === "cancelled") {
    return res.status(400).json({
        message: "Booking is already cancelled"
    });
    }

    booking.status = "cancelled";

    res.json({
        message: "Booking cancelled successfully",
        booking
    });
});

app.get("/rooms", (req, res) => {
    res.json(rooms);
});
app.get("/hotels", (req, res) => {
    res.json(hotels);
});
app.post("/hotels", (req, res) => {
    const { name, location, phone, email, website } = req.body;
    if (!name || !location || !phone || !email || !website) {
        return res.status(400).json({
            message: "All hotel details are required"
        });
    }
    if (
        typeof name !== "string" ||
        typeof location !== "string" ||
        typeof phone !== "string" ||
        typeof email !== "string" ||
        typeof website !== "string" 
    ) {
        return res.status(400).json({
            message: "Hotel details must be in the correct format"
        });
    }
    const newHotel = {
        id: hotels.length
            ? Math.max(...hotels.map(hotel => hotel.id)) + 1
            : 1,
        name: name,
        location: location,
        phone: phone,
        email: email,
        website: website
    };
    hotels.push(newHotel);
    res.json({
        message: "Hotel added successfully",
        hotel: newHotel
    });
});
app.put("/hotels/:id", (req, res) => {
    const hotelId = Number(req.params.id);
    const hotel = hotels.find(hotel => hotel.id === hotelId);
    if (!hotel) {
        return res.status(404).json({
            message: "Hotel not found"
        });
    }
    const { name, location, phone, email, website } = req.body;
    if(!name || !location || !phone || !email || !website) {
        return res.status(400).json({
            message: "All hotel details are required"
        });
    }
    if (
        typeof name !== "string" ||
        typeof location !== "string" ||
        typeof phone !== "string" ||
        typeof email !== "string" ||
        typeof website !== "string"
    ) {
        return res.status(400).json({
            message: "Hotel details must be in the correct format"
        });
    }
    hotel.name = name;
    hotel.location = location;
    hotel.phone = phone;
    hotel.email = email;
    hotel.website = website;
    res.json({
        message: "Hotel updated successfully",
        hotel: hotel
    });
});
app.delete("/hotels/:id", (req, res) => {
    const hotelId = Number(req.params.id);
    const hotelIndex = hotels.findIndex(hotel => hotel.id === hotelId);
    if (hotelIndex === -1) {
        return res.status(404).json({
            message: "Hotel not found"
        });
    }
    const deletedHotel = hotels.splice(hotelIndex, 1);
    res.json({
        message: "Hotel deleted successfully",
        hotel: deletedHotel[0]
    });
});
app.post("/rooms", (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({
            message: "Room name and price are required"
        });
    }
    if (typeof name !== "string") {
        return res.status(400).json({
            message: "Room name must be a string"
        });
    }
    if (name.trim() === "") {
        return res.status(400).json({
            message: "Room name cannot be empty"
        });
    }
    if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({
            message: "Price must be a number greater than 0"
        });
    }
    const newRoom = {
        id: rooms.length
            ? Math.max(...rooms.map(room => room.id)) + 1
            : 1,
        name: name,
        price: price
    };
    rooms.push(newRoom);
    res.json({
        message: "Room added successfully",
        room: newRoom
    });

});
app.delete("/rooms/:id", (req, res) => {
    const roomId = Number(req.params.id);
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    if (roomIndex === -1) {
        return res.status(404).json({
            message: "Room not found"
        });
    }
    const deletedRoom = rooms.splice(roomIndex, 1);
    res.json({
        message: "Room deleted successfully",
        room: deletedRoom[0]
    });
});
app.put("/rooms/:id", (req, res) => {
    const roomId = Number(req.params.id);
    
    const room = rooms.find(room => room.id === roomId);
    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({
            message: "Room name and price are required"
        });
    }
    if (typeof name !== "string") {
        return res.status(400).json({
            message: "Room name must be a string"
        });
    }
    if (name.trim() === "") {
        return res.status(400).json({
            message: "Room name cannot be empty"
        });
    }
    if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({
            message: "Price must be a number greater than 0"
        });
    }
    room.name = name;
    room.price = price;
    res.json({
     message: "Room updated successfully",
     room: room
    });
});
app.post("/meal-orders", (req, res) => {
    const {
        customerName,
        phone,
        roomNumber,
        meal,
        quantity,
        specialRequest
    } = req.body;

    if (!customerName || !phone || !roomNumber || !meal || !quantity) {
        return res.status(400).json({
            message: "Please provide customer name, phone, room number, meal and quantity."
        });
    }

    if (!/^[A-Za-z ]+$/.test(customerName)) {
        return res.status(400).json({
            message: "Customer name must contain letters and spaces only."
        });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            message: "Phone number must be exactly 10 digits."
        });
    }

    if (Number(quantity) < 1) {
        return res.status(400).json({
            message: "Quantity must be at least 1."
        });
    }

    const order = {
        id: mealOrders.length === 0
            ? 1
            : Math.max(...mealOrders.map(order => order.id)) + 1,

        customerName,
        phone,
        roomNumber,
        meal,
        quantity: Number(quantity),
        specialRequest: specialRequest || "",
        status: "pending",
        createdAt: new Date().toISOString()
    };

    mealOrders.push(order);

    res.status(201).json({
        message: "Meal order received successfully. The kitchen has been notified.",
        order
    });
});
app.get("/meal-orders", (req, res) => {
    res.json(mealOrders);
});
app.patch("/meal-orders/:id/status", (req, res) => {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
        "pending",
        "preparing",
        "ready",
        "delivered",
       "cancelled"
];
   
 if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status."
        });
    }

    const order = mealOrders.find(order => order.id === orderId);

    if (!order) {
        return res.status(404).json({
            message: "Meal order not found."
        });
    }

    order.status = status;

    res.json({
        message: "Order status updated successfully.",
        order
    });
});
app.post("/spa-bookings", (req, res) => {
    const {
        customerName,
        phone,
        service,
        date,
        time
    } = req.body;

    if (!customerName || !phone || !service || !date || !time) {
        return res.status(400).json({
            message: "Customer name, phone, service, date and time are required."
        });
    }

    if (!/^[A-Za-z ]+$/.test(customerName)) {
        return res.status(400).json({
            message: "Customer name must contain letters and spaces only."
        });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            message: "Phone number must be exactly 10 digits."
        });
    }

    const booking = {
        id: spaBookings.length === 0
            ? 1
            : Math.max(...spaBookings.map(booking => booking.id)) + 1,

        customerName,
        phone,
        service,
        date,
        time,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    spaBookings.push(booking);

    res.status(201).json({
        message: "Spa booking received successfully.",
        booking
    });
});
app.get("/spa-bookings", (req, res) => {
    res.json(spaBookings);
});

app.patch("/spa-bookings/:id/status", (req, res) => {
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid spa booking status."
        });
    }

    const booking = spaBookings.find(
        booking => booking.id === bookingId
    );

    if (!booking) {
        return res.status(404).json({
            message: "Spa booking not found."
        });
    }

    booking.status = status;

    res.json({
        message: "Spa booking status updated successfully.",
        booking
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong on the server"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});