const express = require('express');
const bodyParser = require('body-parser');
const Helpers = require('./helpers.js');

require('dotenv').config()

const Schema = require("./mysql.js")

const app = express();
app.use(bodyParser.json());

const SERVER_PORT = process.env.SERVER_PORT;

/**
 * API info:
 *  content-type: application/json
 *  endpoint: root,
 *  response: {
 *      status,
 *      message,
 *      endpoints: {
 *          POST: [
 *              '/addNewLine',
 *              '/getNextBottleneck'
 *          ],
 *          GET: [
 *              '/keys'
 *          ]
 *      }
 *  }
 * **/
app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "Fetched all endpoints",
        endpoints: {
            POST: [
                '/addNewLine',
                '/getNextBottleneck'
            ],
            GET: [
                '/keys'
            ]
        }
    })
})

/**
 * API info:
 *  content-type: application/json
 *  endpoint: addNewLine,
 *  data: {
 *      lineName: 4 alphanumeric symbols, i.e. ALX3
 *      arrivalTime: [
 *          {
 *              hour: "24 hour format, 0-24",
 *              min: "0-59"
 *          }
 *      ]
 *  }
 *
 * **/
app.post('/addNewLine', (req, res) => {
    const {lineName, arrivalTime} = req.body;
    if (!lineName || !arrivalTime) {
        res.sendStatus(400);
        return;
    }
    if (!lineName.match(/^[a-zA-Z0-9]{4}$/) || !Helpers.validateTime(arrivalTime)) {
        res.json({
            status: 400,
            params: {
                lineName: "4 alphanumeric symbols, i.e. ALX3",
                arrivalTime: [
                    {
                        hour: "24 hour format, 0-24",
                        min: "0-59"
                    }
                ]
            }
        });
        return;
    }
    Schema.insert(
        {lineName, arrivalTime},
        (result) => {
            res.json({
                status: 200,
                data: result
            })
        },
        (err) => {
            res.json({
                status: 400,
                message: "Query failed",
                err
            })
        })
})

/**
 * API info:
 *  content-type: application/json
 *  endpoint: keys,
 *  response: {
 *      status,
 *      message,
 *      keys: [
 *          {
 *              "COLUMN_NAME": "COLUMN_1"
 *          },
 *          {
 *              "COLUMN_NAME": "COLUMN_2"
 *          }
 *          .
 *          .
 *          .
 *      ]
 *  }
 * **/
app.get('/keys', (req, res) => {
    Schema.keys((keys) =>
        res.json({
            status: 200,
            message: "",
            keys: keys
        }),
        (err) => res.json({
            status: 400,
            message: "Could not fetch keys",
            err
        }))
})


/**
 * API info:
 *  content-type: application/json
 *  endpoint: addNewLine,
 *  data: {
 *      hour: "24 hour format, 0-24",
 *      min: "0-59"
 *  }
 *  response: {
 *  "status",
 *  "message",
 *  "bottleneck": [
 *    {
 *      "HOUR": "24 hour format, 0-24",
 *      "MIN": "0-59"
 *    }
 *  ]
 * }
 *
 * **/
app.post('/getNextBottleneck', (req, res) => {
    const {hour, min} = req.body;
    if (!Helpers.validateTime([hour, min])) {
        res.json({
            status: 400,
            params: {
                lineName: "4 alphanumeric symbols, i.e. ALX3",
                arrivalTime: [
                    {
                        hour: "24 hour format, 0-24",
                        min: "0-59"
                    }
                ]
            }
        });
        return;
    }
    Schema.getNextBottleneck({hour, min}, (bottleneck) =>
            res.json({
                status: 200,
                message: bottleneck.length ? "Bottleneck found!" : "Bottleneck not found!",
                bottleneck,
                time: Helpers.getTime(bottleneck)

            }),
        (err) => res.json({
            status: 400,
            message: "Could not fetch keys",
            err
        }))
})


app.listen(SERVER_PORT, () => {
    console.log(`TOMO app is listening at port ${SERVER_PORT}`)
})