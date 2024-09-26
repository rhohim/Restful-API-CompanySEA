const db = require("../models/connection")
const file = require("../config/filehandling")


const getAllyoutube_data = (req,res ) => {
    const sql = "SELECT * FROM youtube_data"
    db.query(sql, (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching youtube_data",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "youtube_data not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    data : {
                        title : data.title,
                        insight : [
                            {
                                value : data.total_subscribers,
                                unit : "subscribers"
                            },
                            {
                                value : data.total_views,
                                unit : "total views"
                            }
                        ],
                        // total_subscribers : data.total_subscribers,
                        // total_views : data.total_views,
                        last_post : JSON.parse(data.last_post)
                    },
                }))
                res.json({
                    message : "success",
                    youtube :formattedData
                })
        }
        }      
    })
}

const postyoutube_data = async (req, res) => {
    try {
        let imageURL1, imageURL2, imageURL3;
    
        const imageFile_1 = req.files && req.files['image_1'] && req.files['image_1'][0];
        const imageFile_2 = req.files && req.files['image_2'] && req.files['image_2'][0];
        const imageFile_3 = req.files && req.files['image_3'] && req.files['image_3'][0];
        
        imageURL1 = imageFile_1 ? await file.uploadFile(imageFile_1) : '';
        imageURL2 = imageFile_2 ? await file.uploadFile(imageFile_2) : '';
        imageURL3 = imageFile_3 ? await file.uploadFile(imageFile_3) : '';
    
        const { subscribers, views, title_1, description_1, year_1, brand_1, link_1, title_2, description_2, year_2, brand_2, link_2, title_3, description_3, year_3, brand_3, link_3, title } = req.body;
    
        let itemsArray = [
            { title: title_1, description: description_1, year: year_1, brand: brand_1, imageurl: imageURL1, link: link_1 },
            { title: title_2, description: description_2, year: year_2, brand: brand_2, imageurl: imageURL2, link: link_2 },
            { title: title_3, description: description_3, year: year_3, brand: brand_3, imageurl: imageURL3, link: link_3 }
        ];
    
        const itemsArrayJson = JSON.stringify(itemsArray);
        const sql = "INSERT INTO youtube_data (title, total_subscribers, total_views, last_post) VALUES (?, ?, ?, ?)";
        const values = [title, subscribers, views, itemsArrayJson];
    
        db.query(sql, values, (error, result) => {
            if (error) {
                return res.status(500).json({ message: "Error inserting youtube_data", error });
            } else {
                res.json({
                    message: "Success",
                    youtube_dataId: result.insertId
                });
            }
        });
    
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error', details: err.message });
    }
};

const deleteyoutube_data = (req, res) => {
    const sql = 'DELETE FROM youtube_data';

    db.query(sql, (error, result) => {
        if (error) {
            console.error("Error deleting youtube_data:", error);
            res.status(500).json({
                message: "Error deleting youtube_data",
                error: error
            });
        } else {

            const resetAutoIncrement = 'ALTER TABLE youtube_data AUTO_INCREMENT = 1';
            db.query(resetAutoIncrement, (error, result) => {
                if (error) {
                    console.error("Error resetting auto-increment counter:", error);
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

const getyoutube_databyID = (req,res ) => {
    const igID = req.params.id
    const sql = "SELECT * FROM youtube_data WHERE id = ?"
    db.query(sql, [igID], (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching youtube_data",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "youtube_data not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    title : data.title,
                    data : {
                        insight : [
                            {
                                value : data.total_subscribers,
                                unit : "subscribers"
                            },
                            {
                                value : data.total_views,
                                unit : "total views"
                            }
                        ],
                        last_post : JSON.parse(data.last_post)
                    },
                    "message" : "success"
                }))
                res.json(formattedData)
        }
        }      
    })
}

const deleteyoutube_databyID = (req, res) => {
    const youtube_dataId = req.params.id;

    const sql = 'DELETE FROM youtube_data WHERE id = ?';

    db.query(sql, [youtube_dataId], (error, result) => {
        if (error) {
            console.error("Error deleting youtube_data:", error);
            res.status(500).json({
                message: "Error deleting youtube_data",
                error: error
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: "youtube_data not found"
                });
            } else {
                res.json({
                    message: "deleted"
                });
            }
        }
    });
}

const putyoutube_data = async (req, res) => {
    const youtubeDataId = req.params.id;
    const { subscribers, views, title_1, description_1, year_1, brand_1, title_2, description_2, year_2, brand_2, title_3, description_3, year_3, brand_3, title } = req.body;
    const imageFile_1 = req.files && req.files['image_1'] && req.files['image_1'][0];
    const imageFile_2 = req.files && req.files['image_2'] && req.files['image_2'][0];
    const imageFile_3 = req.files && req.files['image_3'] && req.files['image_3'][0];

    try {
        const getCurrentItemsFromDB = () => new Promise((resolve, reject) => {
            db.query('SELECT last_post FROM youtube_data WHERE id = ?', [youtubeDataId], (error, result) => {
                if (error) return reject("Error fetching youtube_data items: " + error);
                if (result.length === 0 || !result[0].last_post) return reject("Items not found in the database");
                resolve(JSON.parse(result[0].last_post));
            });
        });

        let updatedItems = await getCurrentItemsFromDB();

        updatedItems[0].imageurl = imageFile_1 ? await file.uploadFile(imageFile_1) : await updatedItems[0].imageurl
        updatedItems[1].imageurl = imageFile_2 ? await file.uploadFile(imageFile_2) : await updatedItems[1].imageurl
        updatedItems[2].imageurl = imageFile_3 ? await file.uploadFile(imageFile_3) : await updatedItems[2].imageurl
        
        // Update last_post object
        updatedItems[0] = { ...updatedItems[0], title: title_1, description: description_1, year: year_1, brand: brand_1 };
        updatedItems[1] = { ...updatedItems[1], title: title_2, description: description_2, year: year_2, brand: brand_2 };
        updatedItems[2] = { ...updatedItems[2], title: title_3, description: description_3, year: year_3, brand: brand_3 };

        const itemsArrayJson = JSON.stringify(updatedItems);
        const sql = "UPDATE youtube_data SET title = ?, total_subscribers = ?, total_views = ?, last_post = ? WHERE id = ?";
        const values = [title, subscribers, views, itemsArrayJson, youtubeDataId];

        db.query(sql, values, (error, result) => {
            if (error) {
                console.error("Error updating youtube_data:", error);
                return res.status(500).json({ message: "Error updating youtube_data", error });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "YouTube data not found" });
            }
            res.json({ message: "Updated" });
        });
    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};

module.exports = {
    getAllyoutube_data,
    postyoutube_data,
    deleteyoutube_data,
    getyoutube_databyID,
    deleteyoutube_databyID,
    putyoutube_data
}