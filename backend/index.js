

import express from "express";

const PORT = 3000;
const app = express();
app.use(express.json());


let dataBuku = [
  {
    book_id: 1,
    namaBuku: "The Star",
    Isbn: "06354643-131",
    isBorrowed: false, 
    borrower: null, 
  },
  {
    book_id: 2,
    namaBuku: "The End WOW",
    Isbn: "6666697734",
    isBorrowed: false,
    borrower: null,
  },
];
let user = [{ user_id: 1, namaUser: "Alevaro de John", role: "admin" }];


// GETT BOOK BY ID
app.get("/books/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const iBook = dataBuku.findIndex((b) => b.book_id === bookId);

  if (iBook === -1) {
    return res.status(404).json({ msg: "Buku tidak ditemukan" });
  }

  res.json({ data: dataBuku[iBook] });
});

// User Login
app.post("/users/login/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  const iUser = user.findIndex((b) => b.user_id === userId);

  if (iUser === -1) {
    return res.status(404).json({ msg: "User tidak ditemukan" });
  }

  user[iUser].role = role;
  res.status(200).json({
    msg: `User berhasil menjadi ${role}`,
    user: user[iUser]
  });
});

// Post Admin
app.post("/createBook", (req, res) => {
  const currentRole = user[0].role;
  const { namaBuku, Isbn } = req.body;

  if (currentRole === "admin") {
    dataBuku.push({
      book_id: dataBuku.length + 1,
      namaBuku,
      Isbn,
      isBorrowed: false, 
      borrower: null,
    });
    res.status(200).json({
      msg: "Buku sudah ditambahkan",
      data: dataBuku.at(-1),
    });
  } else {
    return res.status(403).json({
      msg: "Akses ditolak. Anda Bukan admin",
    });
  }
});

// Putt (Update Book)
app.put("/updateBook/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const currentRole = user[0].role;
  const { namaBuku, Isbn } = req.body;
  const iBook = dataBuku.findIndex((c) => c.book_id === bookId);

  if (currentRole === "admin") {
    if (iBook === -1) {
      return res.status(404).json({ msg: "Buku tidak ditemukan" });
    }

    dataBuku[iBook].namaBuku = namaBuku || dataBuku[iBook].namaBuku;
    dataBuku[iBook].Isbn = Isbn || dataBuku[iBook].Isbn;

    res.status(200).json({
      msg: `Buku dengan id: ${bookId} berhasil diperbarui.`,
      book: dataBuku[iBook],
    });
  } else {
    return res.status(403).json({
      msg: "Akses ditolak. Role Anda bukan admin.",
    });
  }
});

// DELETE
app.delete("/deleteBook/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const currentRole = user[0].role;
  const iBook = dataBuku.findIndex((c) => c.book_id === bookId);

  if (currentRole === "admin") {
    if (iBook === -1) {
      return res.status(404).json({ msg: "Buku tidak ditemukan." });
    }
    dataBuku.splice(iBook, 1);

    res.status(200).json({
      msg: `Buku dengan ID ${bookId} sudah terhapus.`,
    });
  } else {
    return res.status(403).json({
      msg: "Akses ditolak. Role anda bukan admin",
    });
  }
});

// 📚 PUT - Borrow Book (HANYA Student) 📚
app.put("/borrowBook/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const currentRole = user[0].role;
  const { borrowerName } = req.body; 

  const iBook = dataBuku.findIndex((c) => c.book_id === bookId);


  if (currentRole !== "student") {
    return res.status(403).json({
      msg: "Akses ditolak. HANYA student yang dapat meminjam buku.",
    });
  }

  if (iBook === -1) {
    return res.status(404).json({ msg: "Buku tidak ditemukan." });
  }

  const bookToBorrow = dataBuku[iBook];

  if (bookToBorrow.isBorrowed) {
    return res.status(400).json({
      msg: `Buku '${bookToBorrow.namaBuku}' saat ini sedang dipinjam oleh ${bookToBorrow.borrower}.`,
    });
  }

  if (!borrowerName) {
     return res.status(400).json({
        msg: "Nama peminjam ('borrowerName') wajib diisi di body request.",
      });
  }
  
  
  bookToBorrow.isBorrowed = true;
  bookToBorrow.borrower = borrowerName; 
  
  dataBuku[iBook] = bookToBorrow;

  // 6. Respon Sukses
  res.status(200).json({
    msg: `Buku '${bookToBorrow.namaBuku}' berhasil dipinjam oleh ${borrowerName}.`,
    book: bookToBorrow,
  });
});


app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
