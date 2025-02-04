const express = require("express")
const router = express.Router()
const Poll = require("../models/Poll")

router.post("/create", async (req, res) => {
  try {
    const { question, options, createdBy } = req.body
    const newPoll = new Poll({
      question,
      options,
      votes: new Array(options.length).fill(0),
      voters: [],
      createdBy,
    })
    await newPoll.save()
    res.status(201).json(newPoll)
  } catch (error) {
    res.status(500).json({ message: "Error creating poll", error: error.message })
  }
})

router.post("/vote", async (req, res) => {
  try {
    const { pollId, optionIndex, userId } = req.body
    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }
    if (poll.voters.includes(userId)) {
      return res.status(400).json({ message: "User has already voted" })
    }
    poll.votes[optionIndex]++
    poll.voters.push(userId)
    await poll.save()
    res.status(200).json(poll)
  } catch (error) {
    res.status(500).json({ message: "Error voting on poll", error: error.message })
  }
})

module.exports = router

