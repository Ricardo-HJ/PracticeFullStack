const express = require('express')
const Note = require('./models/note')
const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  console.log(response.body)
  next()
}

const errorHandler = (err, req, res, next) => {
    console.error(err.message)

    if (err.name === 'CastError'){
        return res.status(400).send({ error: 'malformatted id'})
    } else if (err.name === 'ValidationError') {
        return res.status(400).send({ error: error.message})
    }

    next(err)
}

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(err => next(err))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body

    Note.findById(request.params.id)
        .then(note => {
            if (!note) {
                return response.status(404).end()
            }

            note.content = content
            note.important = important

            return note.save().then((updatedNote) => {
                response.json(updatedNote)
            })
        })
        .catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
    const body = request.body
    
    if (!body.content) {
        return response.status(400).json({ 
            error: 'content missing' 
        })
    }
    
    const note = new Note({
        content: body.content,
        important: body.important || false
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(err => next(err))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
