const mysql = require('mysql');

/**
 * DATABASE info:
 *  Create a file named .env in the root directory of the project.
 *  Contents:
 *      *HOST=yourhost
 *      *USER=youruser
 *      *PASSWORD=yourpassword
 *      *DATABASE=yourdatabase
 * **/
const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000
})

module.exports = {
    insert: (data, success, error) => {
        const INSERT = `INSERT INTO TOMO (LINE_NAME, HOUR, MIN) VALUES ? `
        let trainName = data.lineName;
        let values = [data.arrivalTime.map(row => [trainName, row.hour, row.min])]
        db.getConnection((err, conn) => {
            if (err) {
                error(err);
                return;
            }
            console.log("Connected, TIMESTAMP: ", Date.now());
            conn.query(INSERT, values, (err, result) => {
                if (err) {
                    error(err)
                    return;
                }
                success(result)
            })
        })
    },
    keys: (success, error) => {
        db.getConnection((err, conn) => {
            if (err) {
                error(err);
                return;
            }
            conn.query(`SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = 'TOMO'
                          AND TABLE_NAME = 'TOMO';`,
                (err, result) => {
                    console.log("Connected, TIMESTAMP: ", Date.now());
                    if (err) {
                        error(err)
                        return;
                    }
                    success(result)
                })
        })
    },
    getNextBottleneck: (time, success, error) => {
        db.getConnection((err, conn) => {
            if (err) {
                error(err);
                return;
            }
            conn.query(`SELECT HOUR, MIN FROM TOMO GROUP BY HOUR, MIN 
                HAVING HOUR >= '${time.hour}' AND MIN >= '${time.min}' 
                AND COUNT(MIN) > 1 ORDER BY COUNT(MIN) DESC LIMIT 1`,
                (err, result) => {
                    console.log("Connected, TIMESTAMP: ", Date.now());
                    if (err) {
                        error(err)
                        return;
                    }
                    if (!result.length && time.hour !== 0 && time.min !== 0) // Recursive call to next day
                        module.exports.getNextBottleneck({hour: 0, min: 0}, res => success(res), err => error(err))
                    else
                        success(result)
                })
        })
    }
}