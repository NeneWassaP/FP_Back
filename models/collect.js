module.exports = (sequelize, DataTypes) => {
    const collect = sequelize.define("collect", {  
        user_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        file_name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
       freezeTableName: true 
    });

    collect.associate = (models) =>{

        collect.belongsTo(models.user,{
            foreignKey: "user_id",
        });

    };

    return collect;
}