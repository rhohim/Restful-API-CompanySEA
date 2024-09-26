const db = require("../models/connection")
const file = require("../config/filehandling")


const getAllhistory = (req,res ) => {
    const sql = "SELECT * FROM history"
    db.query(sql, (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching history",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "history not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    data : {
                        title : data.title,
                        subtitle : data.subtitle,
                        date : data.date,
                        description : data.description,
                        background_color : data.background_color,
                        image : data.image,
                        background_image : data.background_image
                    },
                }))
                res.json({
                    message : "success",
                    history :formattedData
                })
        }
        }      
    })
}

const posthistory = async (req, res) => {
    try{
        const {title, date, description,background_color, subtitle} = req.body
        const imageFile = req.files && req.files['image'] && req.files['image'][0]
        const bgimageFile = req.files && req.files['background_image'] && req.files['background_image'][0]
        let imageURL, bgimageURL 
        imageURL = imageFile ? await file.uploadFile(imageFile) : ''
        bgimageURL = bgimageFile ? await file.uploadFile(bgimageFile) : ''

        const sql = "INSERT INTO history ( title, date, description,background_color, image, background_image, subtitle) VALUES ( ? ,?, ?, ?, ?, ?, ?)"
        const value = [title, date, description,background_color, imageURL, bgimageURL, subtitle]

        db.query(sql, value, (error, result) => {
            if (error) {
                res.status(500).json({
                    message: "Error inserting history",
                    error: error
                });
            } else {
                res.json({
                    message: "Success",
                    historyId: result.insertId
                });
            }
        })
    }catch{
        res.status(500).send({ error: 'Internal Server Error' });
    }
    
}

const deletehistory = (req, res) => {
    const sql = 'DELETE FROM history';

    db.query(sql, (error, result) => {
        if (error) {
            // console.error("Error deleting history:", error);
            res.status(500).json({
                message: "Error deleting history",
                error: error
            });
        } else {

            const resetAutoIncrement = 'ALTER TABLE history AUTO_INCREMENT = 1';
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

const gethistorybyID = (req, res) => {
    const historyId = req.params.id
    const sql = "SELECT * FROM history WHERE id = ?"
    db.query(sql, [historyId], (error, result) => {
        if (error) {
            // console.error("Error fetching history:", error);
            res.status(500).json({
                message: "Error fetching history",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({
                    message: "history not found"
                });
            } else {
                res.json({
                    id: result[0].id,
                    data : {
                        title : result[0].title,
                        subtitle : result[0].subtitle,
                        date : result[0].date,
                        description : result[0].description,
                        background_color : result[0].background_color,
                        image : result[0].image,
                        background_image : result[0].background_image
                    },
                    message: "Success"
                });
            }
        }
    })
}

const deletehistorybyID = (req, res) => {
    const historyId = req.params.id;

    const sql = 'DELETE FROM history WHERE id = ?';

    db.query(sql, [historyId], (error, result) => {
        if (error) {
            // console.error("Error deleting history:", error);
            res.status(500).json({
                message: "Error deleting history",
                error: error
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: "history not found"
                });
            } else {
                res.json({
                    message: "deleted"
                });
            }
        }
    });
}

const puthistory = async (req, res) => {
    const historyId = req.params.id;
    const { title, date, description, background_color, subtitle } = req.body;
    let imageURL, background_imageURL
    const imageFile = req.files && req.files['image'] && req.files['image'][0] 
    const bgimageFile = req.files && req.files['background_image'] && req.files['background_image'][0]

    try {

        const getImageURLFromDB = () => new Promise((resolve, reject) => {
            db.query('SELECT image FROM history WHERE id = ?', [historyId], (error, result) => {
                if (error) return reject("Error fetching history image: " + error);
                if (result.length === 0 || !result[0].image) return reject("history image not found in the database");
                resolve(result[0].image);
            });
        });

        const getBgImageURLFromDB = () => new Promise((resolve, reject) => {
            db.query('SELECT background_image FROM history WHERE id = ?', [historyId], (error, result) => {
                if (error) return reject("Error fetching history background_image: " + error);
                if (result.length === 0 || !result[0].background_image) return reject("history background_image not found in the database");
                resolve(result[0].background_image);
            });
        });

        imageURL = imageFile ? await file.uploadFile(imageFile) : await getImageURLFromDB();
        background_imageURL = bgimageFile ? await file.uploadFile(bgimageFile) : await getBgImageURLFromDB();

        const sql = "UPDATE history SET title = ?, date = ?, description = ?, background_color = ?, image = ?, background_image = ?, subtitle = ? WHERE id = ?";
        const values = [title, date, description, background_color, imageURL, background_imageURL, subtitle, historyId];

        db.query(sql, values, (error, result) => {
            if (error) {
                // console.error("Error updating history:", error);
                return res.status(500).json({ message: "Error updating history", error });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "History not found" });
            }
            res.json({ message: "Updated" });
        });
    } catch (err) {
        // console.error("An error occurred:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};


module.exports = {
    getAllhistory,
    posthistory,
    deletehistory,
    gethistorybyID,
    deletehistorybyID,
    puthistory
}