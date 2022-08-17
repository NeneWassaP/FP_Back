module.exports = (sequelize, DataTypes) => {
    const word = sequelize.define("word", {  
        unit_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        word : {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
       freezeTableName: true 
    });

    word.associate = (models) =>{
        
        word.belongsTo(models.unit,{
            foreignKey: "unit_id",
        });
    };

    return word;
}