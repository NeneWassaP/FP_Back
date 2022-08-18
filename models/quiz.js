module.exports = (sequelize, DataTypes) => {
    const quiz = sequelize.define("quiz", {  
        user_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Q_number : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        correct_number : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        days : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        correct_days : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        
    }, {
       freezeTableName: true 
    });

    quiz.associate = (models) =>{

        quiz.belongsTo(models.user,{
            foreignKey: "user_id",
        });

    };

    return quiz;
}