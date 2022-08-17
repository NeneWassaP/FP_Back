module.exports = (sequelize, DataTypes) => {
    const track = sequelize.define("track", {
        user_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
       freezeTableName: true 
    });

    track.associate = (models) =>{
        
        track.belongsTo(models.user,{
            foreignKey: "user_id",
        });
    };

    return track;
}