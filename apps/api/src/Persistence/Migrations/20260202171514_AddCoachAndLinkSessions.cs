using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCoachAndLinkSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CoachId",
                table: "TrainingSessions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Coaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coaches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_CoachId",
                table: "TrainingSessions",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_Coaches_Email",
                table: "Coaches",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingSessions_Coaches_CoachId",
                table: "TrainingSessions",
                column: "CoachId",
                principalTable: "Coaches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrainingSessions_Coaches_CoachId",
                table: "TrainingSessions");

            migrationBuilder.DropTable(
                name: "Coaches");

            migrationBuilder.DropIndex(
                name: "IX_TrainingSessions_CoachId",
                table: "TrainingSessions");

            migrationBuilder.DropColumn(
                name: "CoachId",
                table: "TrainingSessions");
        }
    }
}
