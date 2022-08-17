module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define("user", {
        username : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password : {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
       freezeTableName: true 
    });

    user.associate = (models) =>{
        user.hasMany(models.track,{
             foreignKey: "user_id",
         });
     };

    return user;
}