﻿namespace Incoding.UnitTest
{
    #region << Using >>

    using System.Data;
    using Incoding.Block;
    using Incoding.Data;
    using Incoding.MSpecContrib;
    using Machine.Specifications;
    using NCrunch.Framework;
    using Raven.Client.Document;

    #endregion

    [Subject(typeof(DelayToScheduler)), Isolated]
    public class When_save_DelayToScheduler : SpecWithPersistenceSpecification<DelayToScheduler>
    {
        It should_be_ef = () => new PersistenceSpecification<DelayToScheduler>(PleasureForData.BuildEFSessionFactory(new IncDbContext("IncRealEFSchedulerDb", typeof(DelayToScheduler).Assembly), true)
                                                                                              .Create(IsolationLevel.ReadUncommitted, true, null))
                                        .VerifyMappingAndSchema();

        It should_be_nhibernate = () => new PersistenceSpecification<DelayToScheduler>()
                                                .VerifyMappingAndSchema();

        It should_be_raven_db = () => new PersistenceSpecification<DelayToScheduler>(PleasureForData.BuildRavenDb(new DocumentStore
                                                                                                                  {
                                                                                                                          Url = "http://localhost:8090/",
                                                                                                                          DefaultDatabase = "IncTest",
                                                                                                                  }).Create(IsolationLevel.ReadCommitted))
                                              .VerifyMappingAndSchema();
    }
}