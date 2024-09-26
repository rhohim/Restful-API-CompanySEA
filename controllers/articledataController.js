const db = require("../models/connection")
const file = require("../config/filehandling")

const getAllarticle_data = (req,res ) => {
    const sql = "SELECT * FROM article_data"
    db.query(sql, (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching article_data",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "article_data not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    data : {
                        title : data.title,
                        insight : [
                            {
                                value : data.total_visitor,
                                unit : "total visitor"
                            },
                            {
                                value : data.total_article,
                                unit : "total article"
                            }
                        ],
                        last_post : JSON.parse(data.last_post)
                    },
                    
                }))
                res.json({
                    message : "success",
                    article :formattedData
                })
        }
        }      
    })
}
 
const postarticle_data = async (req, res) => {
    try {
        let imageURL1, imageURL2, imageURL3;
        const imageFile_1 = req.files && req.files['image_1'] && req.files['image_1'][0]
        const imageFile_2 = req.files && req.files['image_2'] && req.files['image_2'][0]
        const imageFile_3 = req.files && req.files['image_3'] && req.files['image_3'][0]
        
        imageURL1 = imageFile_1 ? await file.uploadFile(imageFile_1) : ''
        imageURL2 = imageFile_2 ? await file.uploadFile(imageFile_2) : ''
        imageURL3 = imageFile_3 ? await file.uploadFile(imageFile_3) : ''
        
        const { visitor, article, title_1, description_1, year_1, brand_1, title_2, description_2, year_2, brand_2, title_3, description_3, year_3, brand_3, title} = req.body;
        let itemsArray = [
            { title: title_1, description: description_1, year: year_1, brand: brand_1, imageurl: imageURL1 },
            { title: title_2, description: description_2, year: year_2, brand: brand_2, imageurl: imageURL2 },
            { title: title_3, description: description_3, year: year_3, brand: brand_3, imageurl: imageURL3 }
        ];

        const itemsArrayJson = JSON.stringify(itemsArray);
        const sql = "INSERT INTO article_data (title, total_visitor, total_article, last_post) VALUES (?, ?, ?, ?)";
        const values = [title, visitor, article, itemsArrayJson];

        db.query(sql, values, (error, result) => {
            if (error) {
                // console.error("Error inserting article_data:", error);
                return res.status(500).json({ message: "Error inserting article_data", error });
            } else {
                res.json({
                    message: "Success",
                    article_dataId: result.insertId
                });
            }
        });

    } catch (err) {
        //console.error("An unexpected error occurred:", err);
        res.status(500).send({ error: 'Internal Server Error', details: err.message });
    }
};

const deletearticle_data = (req, res) => {
    const sql = 'DELETE FROM article_data';

    db.query(sql, (error, result) => {
        if (error) {
            // console.error("Error deleting article_data:", error);
            res.status(500).json({
                message: "Error deleting article_data",
                error: error
            });
        } else {

            const resetAutoIncrement = 'ALTER TABLE article_data AUTO_INCREMENT = 1';
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

const getarticle_databyID = (req,res ) => {
    const igID = req.params.id
    const sql = "SELECT * FROM article_data WHERE id = ?"
    db.query(sql, [igID], (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching article_data",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "article_data not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    data : {
                        title : data.title,
                        insight : [
                            {
                                value : data.total_visitor,
                                unit : "total visitor"
                            },
                            {
                                value : data.total_article,
                                unit : "total article"
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

const deletearticle_databyID = (req, res) => {
    const article_dataId = req.params.id;

    const sql = 'DELETE FROM article_data WHERE id = ?';

    db.query(sql, [article_dataId], (error, result) => {
        if (error) {
            // console.error("Error deleting article_data:", error);
            res.status(500).json({
                message: "Error deleting article_data",
                error: error
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: "article_data not found"
                });
            } else {
                res.json({
                    message: "deleted"
                });
            }
        }
    });
}

const putarticle_data = async (req, res) => {
    const artcileID = req.params.id;
    const { visitor, article, title_1, description_1, year_1, brand_1, title_2, description_2, year_2, brand_2, title_3, description_3, year_3, brand_3, title } = req.body;
    const imagefile_1 = req.files && req.files['image_1'] && req.files['image_1'][0]
    const imagefile_2 = req.files && req.files['image_2'] && req.files['image_2'][0]
    const imagefile_3 = req.files && req.files['image_3'] && req.files['image_3'][0]
    
    try {
        const getCurrentItemsFromDB = () => new Promise((resolve, reject) => {
            db.query('SELECT last_post FROM article_data WHERE id = ?', [artcileID], (error, result) => {
                if (error) return reject("Error fetching article_data items: " + error);
                if (result.length === 0 || !result[0].last_post) return reject("Items not found in the database");
                resolve(JSON.parse(result[0].last_post));
            });
        });

        let updatedItems = await getCurrentItemsFromDB();

        updatedItems[0].imageurl = imagefile_1 ? await file.uploadFile(imagefile_1) : await updatedItems[0].imageurl
        updatedItems[1].imageurl = imagefile_2 ? await file.uploadFile(imagefile_2) : await updatedItems[1].imageurl
        updatedItems[2].imageurl = imagefile_3 ? await file.uploadFile(imagefile_3) : await updatedItems[2].imageurl
        
        //update lastpost object
        updatedItems[0] = { ...updatedItems[0], title: title_1, description: description_1, year: year_1, brand: brand_1 };
        updatedItems[1] = { ...updatedItems[1], title: title_2, description: description_2, year: year_2, brand: brand_2 };
        updatedItems[2] = { ...updatedItems[2], title: title_3, description: description_3, year: year_3, brand: brand_3 };

        const itemsArrayJson = JSON.stringify(updatedItems);
        const sql = "UPDATE article_data SET title = ? , total_visitor = ?, total_article = ?, last_post = ? WHERE id = ?";
        const values = [title, visitor, article, itemsArrayJson, artcileID];

        db.query(sql, values, (error, result) => {
            if (error) {
                // console.error("Error updating article_data:", error);
                return res.status(500).json({ message: "Error updating article_data", error });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "ig data not found" });
            }
            res.json({ message: "Updated" });
        });
    } catch (err) {
        // console.error("An error occurred:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};

module.exports = {
    getAllarticle_data,
    postarticle_data,
    deletearticle_data,
    getarticle_databyID,
    deletearticle_databyID,
    putarticle_data
}