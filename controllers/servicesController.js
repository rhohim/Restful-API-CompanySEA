const db = require("../models/connection")
const file = require("../config/filehandling")

const getAllservices = (req,res ) => {
    const sql = `
        SELECT 
            s.*, 
            p.id AS portofolioId, 
            p.title, 
            p.introduction, 
            p.year_project, 
            p.scope, 
            p.team, 
            p.content_1, 
            p.content_2, 
            p.portofolio_cover, 
            p.created_at AS portofolio_created_at,
            cl.client_name, 
            cl.logo
        FROM services s
        LEFT JOIN portofolio p ON p.services_id = s.id
        LEFT JOIN client cl ON p.client_id = cl.id
    `;

    db.query(sql, (error, result) => {
        if (error) {
            return res.status(500).json({
                message: "Error fetching services",
                error: error
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Services not found"
            });
        }

        const serviceMap = {};
        result.forEach(data => {
            if (!serviceMap[data.id]) {
                serviceMap[data.id] = {
                    id: data.id,
                    data : {
                        name: data.services_name,
                        cover: data.cover,
                        short_description: data.short_description,
                        portofolio: []
                    }
                };
            }

            if (data.portofolioId) {
                serviceMap[data.id].data.portofolio.push({
                    // id: data.portofolioId,
                    title : data.title, 
                    introduction : data.introduction, 
                    year_project : data.year_project, 
                    scope : data.scope, 
                    team : data.team, 
                    content_1 : data.content_1, 
                    content_2 : data.content_2,
                    cover: data.portofolio_cover, 
                    created_at : data.created_at,
                    client : {
                        name :data.client_name,
                        logo : data.logo
                    },
                    services : {
                        name : data.services_name,
                        cover : data.cover,
                        short_description : data.short_description
                    }
                });
            }
        });
        // Object.values(serviceMap).forEach(service => {
        //     if (!service.data.portofolio.length) {
        //         service.data.portofolio = [];
        //     }
        // });

        const formattedData = Object.values(serviceMap);
        res.json({
            message : "success",
            services :formattedData
        })
    });
}

const postservices = async (req, res) => {
    try{
        let coverURL
        const coverFile = req.files && req.files['cover'] && req.files['cover'][0]
        coverURL = coverFile ? await file.uploadFile(coverFile) : ''
        const {name, short_description} = req.body
        
        const sql = "INSERT INTO services ( services_name, cover, short_description) VALUES (?, ?, ?)"
        const value = [name, coverURL, short_description]

        db.query(sql, value, (error, result) => {
            if (error) {
                res.status(500).json({
                    message: "Error inserting services",
                    error: error
                });
            } else {
                res.json({
                    message: "Success",
                    servicesId: result.insertId
                });
            }
        })
    }catch{
        res.status(500).send({ error: 'Internal Server Error' });
    }
    
}

const deleteservices = (req, res) => {
    const sql = 'DELETE FROM services';

    db.query(sql, (error, result) => {
        if (error) {
            console.error("Error deleting services:", error);
            res.status(500).json({
                message: "Error deleting services",
                error: error
            });
        } else {

            const resetAutoIncrement = 'ALTER TABLE services AUTO_INCREMENT = 1';
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

const getservicesbyID = (req, res) => {
    const servicesId = req.params.id
    const sql = `
    SELECT 
            s.*, 
            p.id AS portofolioId, 
            p.title, 
            p.introduction, 
            p.year_project, 
            p.scope, 
            p.team, 
            p.content_1, 
            p.content_2, 
            p.portofolio_cover, 
            p.created_at AS portofolio_created_at,
            cl.client_name, 
            cl.logo
        FROM services s
        LEFT JOIN portofolio p ON p.services_id = s.id
        LEFT JOIN client cl ON p.client_id = cl.id
    WHERE s.id = ?
`;
    db.query(sql, [servicesId], (error, result) => {
        if (error) {
            console.error("Error fetching services:", error);
            res.status(500).json({
                message: "Error fetching services",
                error: error
            });
        } else {
            if (result.length === 0) {
                res.status(404).json({
                    message: "services not found"
                });
            } else {
                const serviceMap = {};
                result.forEach(data => {
                    if (!serviceMap[data.id]) {
                        serviceMap[data.id] = {
                            id: data.id,
                            data : {
                                name: data.services_name,
                                cover: data.cover,
                                short_description: data.short_description,
                                portofolio: []
                            }
                        };
                    }

                    if (data.portofolioId) {
                        serviceMap[data.id].data.portofolio.push({
                            // id: data.portofolioId,
                            title : data.title, 
                            introduction : data.introduction, 
                            year_project : data.year_project, 
                            scope : data.scope, 
                            team : data.team, 
                            content_1 : data.content_1, 
                            content_2 : data.content_2,
                            cover: data.portofolio_cover, 
                            created_at : data.created_at,
                            client : {
                                name :data.client_name,
                                logo : data.logo
                            },
                            services : {
                                name : data.services_name,
                                cover : data.cover,
                                short_description : data.short_description
                            }
                        });
                    }
                });

                const formattedData = Object.values(serviceMap);
                res.json(formattedData);
            }
        }
    })
}

const deleteservicesbyID = (req, res) => {
    const servicesId = req.params.id;

    const sql = 'DELETE FROM services WHERE id = ?';

    db.query(sql, [servicesId], (error, result) => {
        if (error) {
            console.error("Error deleting services:", error);
            res.status(500).json({
                message: "Error deleting services",
                error: error
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: "services not found"
                });
            } else {
                res.json({
                    message: "deleted"
                });
            }
        }
    });
}

const putservices = async (req, res) => {
    const servicesId = req.params.id
    let coverURL
    const coverFile = req.files && req.files['cover'] && req.files['cover'][0]
    const {name, short_description} = req.body
    try {
        const getservicesURLFromDB = () => new Promise((resolve, reject) => {
            const sqlSelectImage = 'SELECT cover FROM services WHERE id = ?';
            db.query(sqlSelectImage, [servicesId], (error, result) => {
                if (error) return reject("Error fetching services cover" + error)
                if (result.length === 0 || !result[0].cover) return reject("services cover not found in the database")
                resolve(result[0].cover)
            })
        })
        coverURL = coverFile ? await file.uploadFile(coverFile) : await getservicesURLFromDB()
        
        const sql = "UPDATE services SET services_name = ?, cover = ? , short_description = ? WHERE id = ?"
        const value = [name, coverURL, short_description, servicesId]
        db.query(sql, value, (error, result) => {
            if (error) {
                console.error("Error updating services:", error);
                res.status(500).json({
                    message: "Error updating services", 
                    error: error
                });
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({
                        message: "services not found"
                    });
                } else {
                    res.json({
                        message: "Updated"
                    });
                }
            }
        });

        // updateservices()
        // function updateservices(){
        //     const sql = "UPDATE services SET services_name = ?, cover = ? , short_description = ? WHERE id = ?"
        //     const value = [name, coverURL, short_description, servicesId]
        //     db.query(sql, value, (error, result) => {
        //         if (error) {
        //             console.error("Error updating services:", error);
        //             res.status(500).json({
        //                 message: "Error updating services", 
        //                 error: error
        //             });
        //         } else {
        //             if (result.affectedRows === 0) {
        //                 res.status(404).json({
        //                     message: "services not found"
        //                 });
        //             } else {
        //                 res.json({
        //                     message: "Updated"
        //                 });
        //             }
        //         }
        //     });
        // }
    } catch(err) {
        console.error("An error occurred:", err);
        res.status(500).json({
            message: "An error occurred",
            error: err.message
        });
    }
    
}

module.exports = {
    getAllservices,
    postservices,
    deleteservices,
    getservicesbyID,
    deleteservicesbyID,
    putservices
}