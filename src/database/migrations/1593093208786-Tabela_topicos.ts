import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class TabelaTopicos1593093208786 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "topics",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: "sectionId", 
                    type: "integer"
                }
            ]
        }))

        await queryRunner.createForeignKey("topics", new TableForeignKey({
            columnNames: ["sectionId"],
            referencedColumnNames: ["id"],
            referencedTableName: "sections",
            onDelete: "CASCADE"
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("question");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("questionId") !== -1);

        await queryRunner.dropForeignKey("topics", foreignKey);
        await queryRunner.dropTable("topics");
    }

}
