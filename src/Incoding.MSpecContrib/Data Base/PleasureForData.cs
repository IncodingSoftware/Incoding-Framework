namespace Incoding.MSpecContrib
{
    #region << Using >>

    using System;
    using System.Data.Entity;
    using System.Windows.Forms;
    using FluentNHibernate;
    using FluentNHibernate.Cfg;
    using Incoding.Data;
    using Incoding.Extensions;
    using MongoDB.Bson.Serialization;
    using MongoDB.Driver;
    using Raven.Client.Document;

    #endregion

    public static class PleasureForData
    {
        #region Factory constructors

        public static void StartNhibernate(FluentConfiguration fluentConfiguration, bool reloadDb = true)
        {
            SpecWithRepository.Repository = BuildNhibernateRepository(fluentConfiguration, reloadDb);
        }

        public static void StartEF(IncDbContext dbContext, bool reloadDb = true)
        {
            SpecWithRepository.Repository = BuildEFRepository(dbContext, reloadDb);
        }

        #endregion

        public static IRepository BuildRavenDbRepository(DocumentStore document)
        {
            var documentSession = document.Initialize().OpenSession();
            return new RavenDbRepository(Pleasure.MockStrictAsObject<IRavenDbSessionFactory>(mock => mock.Setup(r => r.GetCurrent()).Returns(documentSession)));
        }

        public static IRepository BuildEFRepository(IncDbContext dbContext, bool reloadDb = true)
        {
            try
            {
                if (reloadDb)
                {
                    Database.SetInitializer(new CreateDatabaseIfNotExists<IncDbContext>());
                    dbContext.Database.CreateIfNotExists();
                }
                else
                    Database.SetInitializer(new NullDatabaseInitializer<IncDbContext>());

                return new EntityFrameworkRepository(Pleasure.MockStrictAsObject<IEntityFrameworkSessionFactory>(mock => mock.Setup(r => r.GetCurrent()).Returns(dbContext)));
            }
                    
                    
                    
                    
                    
                    ////ncrunch: no coverage start
            catch (Exception e)
            {
                Clipboard.SetText("Exception in  build configuration {0}".F(e));
                return null;
            }

            ////ncrunch: no coverage end      
        }

        public static IRepository BuildNhibernateRepository(FluentConfiguration instanceBuilderConfiguration, bool reloadDb = true)
        {
            try
            {
                if (reloadDb)
                {
                    IManagerDataBase managerDataBase = new NhibernateManagerDataBase(instanceBuilderConfiguration);
                    if (!managerDataBase.IsExist())
                        managerDataBase.Create();

                    managerDataBase.Update();
                }

                return new NhibernateRepository(Pleasure.MockStrictAsObject<INhibernateSessionFactory>(mock => mock.Setup(r => r.GetCurrent()).Returns(new SessionSource(instanceBuilderConfiguration).CreateSession())));
            }
                    
                    
                    
                    
                    
                    ////ncrunch: no coverage start
            catch (Exception e)
            {
                Clipboard.SetText("Exception in  build configuration {0}".F(e));
                return null;
            }

            ////ncrunch: no coverage end  
        }

        public static IRepository BuildMongoDbRepository(string url, bool reload = true)
        {
            var mongoUrl = new MongoUrl(url);
            var db = new MongoClient(mongoUrl).GetServer();
            if (reload)
            {
                if (db.DatabaseExists(mongoUrl.DatabaseName))
                    db.DropDatabase(mongoUrl.DatabaseName);
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(IncEntityBase)))
                BsonClassMap.RegisterClassMap<IncEntityBase>(map => map.UnmapProperty(r => r.Id));
            var session = new MongoDatabaseDisposable(db.GetDatabase(mongoUrl.DatabaseName));
            return new MongoDbRepository(Pleasure.MockStrictAsObject<IMongoDbSessionFactory>(mock => mock.Setup(r => r.GetCurrent()).Returns(session)));
        }
    }
}