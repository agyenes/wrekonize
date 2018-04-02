using NewShit.Models;
using System;
using System.Linq;

namespace ContosoUniversity.Data
{
    public static class DbInitializer
    {
        public static void Initialize(PictureContext context)
        {
            context.Database.EnsureCreated();

            // Look for any pictures.
            if (context.Pictures.Any())
            {
                return;   // DB has been seeded
            }

            var pictures = new Picture[]
            {
            new Picture{Faces=2,Gender="male"},
            new Picture{Faces=1,Gender="female"},
            };
            foreach (Picture s in pictures)
            {
                context.Pictures.Add(s);
            }
            context.SaveChanges();
        }
    }
}