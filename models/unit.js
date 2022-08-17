module.exports = (sequelize, DataTypes) => {
    const unit = sequelize.define("unit", {  
    }, {
       freezeTableName: true 
    });

    unit.associate = (models) =>{
        
        unit.hasMany(models.word,{
            foreignKey: "unit_id",
        });
    };

    return unit;
}