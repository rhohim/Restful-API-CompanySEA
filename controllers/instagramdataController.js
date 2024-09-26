const db = require("../models/connection")
const file = require("../config/filehandling")


const getAllig_data = (req,res ) => {
    const sql = "SELECT * FROM ig_data"
    db.query(sql, (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching ig_data",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "ig_data not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    title : data.title,
                    data : {
                        insight : [
                            {
                                value : data.total_followers,
                                unit : "total followers"
                            },
                            {
                                value : data.ER,
                                unit : "Accounts Reached"
                            }
                        ],
                        last_post : JSON.parse(data.last_post)
                    },
                }))
                res.json({
                    message : "success",
                    instagram :formattedData
                })
        }
        }      
    })
}

const postig_data = async (req,res) => {
    try {
        let imageURL1,imageURL2,imageURL3
        const imageFile1 = req.files && req.files['image_1'] && req.files['image_1'][0]
        const imageFile2 = req.files && req.files['image_2'] && req.files['image_2'][0]
        const imageFile3 = req.files && req.files['image_3'] && req.files['image_3'][0]

        imageURL1 = imageFile1 ? await file.uploadFile(imageFile1) : ''
        imageURL2 = imageFile2 ? await file.uploadFile(imageFile2) : ''
        imageURL3 = imageFile3 ? await file.uploadFile(imageFile3) : ''

        const { followers, er, title_1, description_1, year_1, brand_1, title_2, link_1, description_2, year_2, brand_2, link_2, title_3, description_3, year_3, brand_3, link_3, title } = req.body;
        let itemsArray = [
            { title: title_1, description: description_1, year: year_1, brand: brand_1, imageurl: imageURL1, link : link_1 },
            { title: title_2, description: description_2, year: year_2, brand: brand_2, imageurl: imageURL2, link : link_2 },
            { title: title_3, description: description_3, year: year_3, brand: brand_3, imageurl: imageURL3, link : link_3 }
        ];
        console.log(followers,er,imageURL1,imageURL2,imageURL3);
        const sql = "INSERT INTO ig_data ( title, total_followers, ER, last_post) VALUES (?, ?, ?, ?)"
        const itemsArrayJson = JSON.stringify(itemsArray);
        const value = [title, followers, er ,itemsArrayJson]


        db.query(sql, value, (error, result) => {
            if (error) {
                res.status(500).json({
                    message: "Error inserting ig_data",
                    error: error
                });
            } else {
                res.json({
                    message: "Success",
                    ig_dataId: result.insertId
                });
            }
        })

    } catch{
        res.status(500).send({ error: 'Internal Server Error' });
    }
    
}

const deleteig_data = (req, res) => {
    const sql = 'DELETE FROM ig_data';

    db.query(sql, (error, result) => {
        if (error) {
            console.error("Error deleting ig_data:", error);
            res.status(500).json({
                message: "Error deleting ig_data",
                error: error
            });
        } else {

            const resetAutoIncrement = 'ALTER TABLE ig_data AUTO_INCREMENT = 1';
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

const getig_databyID = (req,res ) => {
    const igID = req.params.id
    const sql = "SELECT * FROM ig_data WHERE id = ?"
    db.query(sql, [igID], (error, result) => {
        if (error){
            res.status(500).json({
                message: "Error fetching ig_data",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({ 
                    message: "ig_data not found"
                });
            } else {
                const formattedData = result.map(data => ({
                    id: data.id,
                    title : data.title,
                    data : {
                        insight : [
                            {
                                value : data.total_followers,
                                unit : "total followers"
                            },
                            {
                                value : data.ER,
                                unit : "Accounts Reached"
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

const deleteig_databyID = (req, res) => {
    const ig_dataId = req.params.id;

    const sql = 'DELETE FROM ig_data WHERE id = ?';

    db.query(sql, [ig_dataId], (error, result) => {
        if (error) {
            console.error("Error deleting ig_data:", error);
            res.status(500).json({
                message: "Error deleting ig_data",
                error: error
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: "ig_data not found"
                });
            } else {
                res.json({
                    message: "deleted"
                });
            } 
        }
    });
}

const putig_data = async (req, res) => {
    const igDataId = req.params.id;
    const { followers, er, title_1, description_1, year_1, brand_1, link_1, title_2, description_2, year_2, brand_2, link_2, title_3, description_3, year_3, brand_3, link_3, title } = req.body;
    const imageFile1 = req.files && req.files['image_1'] && req.files['image_1'][0]
    const imageFile2 = req.files && req.files['image_2'] && req.files['image_2'][0]
    const imageFile3 = req.files && req.files['image_3'] && req.files['image_3'][0]

    try {
        const getCurrentItemsFromDB = () => new Promise((resolve, reject) => {
            db.query('SELECT last_post FROM ig_data WHERE id = ?', [igDataId], (error, result) => {
                if (error) return reject("Error fetching ig_data items: " + error);
                if (result.length === 0 || !result[0].last_post) return reject("Items not found in the database");
                resolve(JSON.parse(result[0].last_post));
            });
        });
        let updatedItems = await getCurrentItemsFromDB();

        updatedItems[0].imageurl = imageFile1 ? await file.uploadFile(imageFile1) : await updatedItems[0].imageurl
        updatedItems[1].imageurl = imageFile2 ? await file.uploadFile(imageFile2) : await updatedItems[1].imageurl
        updatedItems[2].imageurl = imageFile3 ? await file.uploadFile(imageFile3) : await updatedItems[2].imageurl
        
        updatedItems[0] = { ...updatedItems[0], title: title_1, description: description_1, year: year_1, brand: brand_1, link : link_1 };
        updatedItems[1] = { ...updatedItems[1], title: title_2, description: description_2, year: year_2, brand: brand_2, link : link_2 };
        updatedItems[2] = { ...updatedItems[2], title: title_3, description: description_3, year: year_3, brand: brand_3, link : link_3 };

        const itemsArrayJson = JSON.stringify(updatedItems);
        const sql = "UPDATE ig_data SET title = ? , total_followers = ?, ER = ?, last_post = ? WHERE id = ?";
        const values = [title, followers, er, itemsArrayJson, igDataId];

        db.query(sql, values, (error, result) => {
            if (error) {
                console.error("Error updating ig_data:", error);
                return res.status(500).json({ message: "Error updating ig_data", error });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "ig data not found" });
            }
            res.json({ message: "Updated" });
        });
    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};

module.exports = {
    getAllig_data,
    postig_data,
    deleteig_data,
    getig_databyID,
    deleteig_databyID,
    putig_data
}