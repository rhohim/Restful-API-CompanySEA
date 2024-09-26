const db = require("../models/connection")
const file = require("../config/filehandling")

const getAllhistory_overview = (req,res ) => {
    const sql = "SELECT * FROM history_overview"
    db.query(sql, (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching history_overview",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "history_overview not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    data : {
                        image : data.image,
                        title : data.title,
                        date : data.date,
                        description : data.description
                    },
                }))
                res.json({
                    message : "success",
                    history_overview :formattedData
                })
        }
        }      
    })
}

const posthistory_overview = async (req, res) => {
    try{
        const {title, date, description} = req.body
        const imageFile = req.files && req.files['image'] && req.files['image'][0]
        let imageURL
        imageURL = imageFile ? await file.uploadFile(imageFile) : ''

        const sql = "INSERT INTO history_overview ( image, title, date, description) VALUES (? ,?, ?, ?)"
        const value = [imageURL , title, date, description]

        db.query(sql, value, (error, result) => {
            if (error) {
                res.status(500).json({
                    message: "Error inserting history_overview",
                    error: error
                });
            } else {
                res.json({
                    message: "Success",
                    history_overviewId: result.insertId
                });
            }
        })
    }catch{
        res.status(500).send({ error: 'Internal Server Error' });
    }
    
}

const deletehistory_overview = (req, res) => {
    const sql = 'DELETE FROM history_overview';

    db.query(sql, (error, result) => {
        if (error) {
            // console.error("Error deleting history_overview:", error);
            res.status(500).json({
                message: "Error deleting history_overview",
                error: error
            });
        } else {

            const resetAutoIncrement = 'ALTER TABLE history_overview AUTO_INCREMENT = 1';
            db.query(resetAutoIncrement, (error, result) => {
                if (error) {
                    // console.error("Error resetting auto-increment counter:", error);
                    res.status(500).json({
                        message: "Error resetting auto-increment counter",
                        error: error
                    });
                } else {
                    res.json({
                        message: "deleted"
		            });
	            }
            });
        }
    });
}

const gethistory_overviewbyID = (req, res) => {
    const history_overviewId = req.params.id
    const sql = "SELECT * FROM history_overview WHERE id = ?"
    db.query(sql, [history_overviewId], (error, result) => {
        if (error) {
            // console.error("Error fetching history_overview:", error);
            res.status(500).json({
                message: "Error fetching history_overview",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({
                    message: "history_overview not found"
                });
            } else {
                res.json({
                    id: result[0].id,
                    data : {
                        image : result[0].image,
                        title : result[0].title,
                        date : result[0].date,
                        description : result[0].description
                    },
                    message: "Success"
                });
            }
        }
    })
}

const deletehistory_overviewbyID = (req, res) => {
    const history_overviewId = req.params.id;

    const sql = 'DELETE FROM history_overview WHERE id = ?';

    db.query(sql, [history_overviewId], (error, result) => {
        if (error) {
            // console.error("Error deleting history_overview:", error);
            res.status(500).json({
                message: "Error deleting history_overview",
                error: error
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: "history_overview not found"
                });
            } else {
                res.json({
                    message: "deleted"
                });
            }
        }
    });
}

const puthistory_overview = async (req, res) => {
    const history_overviewId = req.params.id;
    const { title, date, description} = req.body;
    let imageURL
    const imageFile = req.files && req.files['image'] && req.files['image'][0] 

    try {

        const getImageURLFromDB = () => new Promise((resolve, reject) => {
            db.query('SELECT image FROM history_overview WHERE id = ?', [history_overviewId], (error, result) => {
                if (error) return reject("Error fetching history_overview image: " + error);
                if (result.length === 0 || !result[0].image) return reject("history_overview image not found in the database");
                resolve(result[0].image);
            });
        });


        imageURL = imageFile ? await file.uploadFile(imageFile) : await getImageURLFromDB();
        const sql = "UPDATE history_overview SET title = ?, date = ?, description = ?, image = ? WHERE id = ?";
        const values = [title, date, description, imageURL, history_overviewId];

        db.query(sql, values, (error, result) => {
            if (error) {
                // console.error("Error updating history_overview:", error);
                return res.status(500).json({ message: "Error updating history_overview", error });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "History_overview not found" });
            }
            res.json({ message: "Updated" });
        });
    } catch (err) {
        // console.error("An error occurred:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};


module.exports = {
    getAllhistory_overview,
    posthistory_overview,
    deletehistory_overview,
    gethistory_overviewbyID,
    deletehistory_overviewbyID,
    puthistory_overview
}