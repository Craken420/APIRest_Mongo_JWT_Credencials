const express = require('express')
const User = require('../models/User')
const auth = require ('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
    console.log('hola')
    res.json({lol:'hola'})
})

router.get('/users', async (req, res) => {
    try {
        console.log(User.find())
        const users = await User.find()
        res.status(201).send({users})
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredencials(email, password)
        if (!user)
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (err) {
        res.status(400).send(err)
    }
})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send('Logged Out')
    } catch(error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send('All Logged Out')
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
