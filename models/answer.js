module.exports = (sequelize, DataTypes) => {
    const answer = sequelize.define("answer", {  
        user_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        word_id : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_correct : {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    }, {
       freezeTableName: true 
    });

    answer.associate = (models) =>{

        answer.belongsTo(models.user,{
            foreignKey: "user_id",
        });
        answer.belongsTo(models.word,{
            foreignKey: "word_id",
        });

    };

    return answer;
}