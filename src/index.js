const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Create a poll
app.post("/polls", async (req, res) => {
  const { question, options } = req.body;
  const poll = await prisma.poll.create({
    data: {
      question,
      options: {
        create: options.map((text) => ({ text })),
      },
    },
    include: { options: true },
  });
  res.json(poll);
});

// Vote on a poll
app.post("/polls/:id/vote", async (req, res) => {
  const { userId, optionId } = req.body;
  const pollId = Number(req.params.id);

  try {
    const vote = await prisma.vote.create({
      data: { userId, pollId, optionId },
    });
    res.json(vote);
  } catch (err) {
    res.status(400).json({ error: "User has already voted on this poll" });
  }
});

// Get poll results
app.get("/polls/:id", async (req, res) => {
  const poll = await prisma.poll.findUnique({
    where: { id: Number(req.params.id) },
    include: { options: { include: { votes: true } } },
  });
  res.json(poll);
});

app.get("/", (req, res) => {
  res.send(" Realtime Polling API is running!");
});


app.listen(3000, () => {
  console.log(" Server running at http://localhost:3000");
});
