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
        A1 : {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "zen"
        },
        A2 : {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "zen"
        },
        A3 : {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "zen"
        },
    }, {
       freezeTableName: true 
    });

    word.associate = (models) =>{
        
        word.belongsTo(models.unit,{
            foreignKey: "unit_id",
        });
        word.hasMany(models.answer,{
            foreignKey: "word_id",
        });

    };

    return word;
}