using NewShit.Models;
using Microsoft.EntityFrameworkCore;

namespace ContosoUniversity.Data
{
    public class PictureContext : DbContext
    {
        public PictureContext(DbContextOptions<PictureContext> options) : base(options)
        {
        }

        public DbSet<Picture> Pictures { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Picture>().ToTable("Picture");
        }
    }
}
