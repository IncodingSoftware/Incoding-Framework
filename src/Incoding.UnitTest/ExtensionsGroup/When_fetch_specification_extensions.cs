﻿namespace Incoding.UnitTest.ExtensionsGroup
{
    #region << Using >>

    using System;
    using Incoding.Data;
    using Incoding.Extensions;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(SpecificationException))]
    public class When_fetch_specification_extensions
    {
        #region Fake classes

        class FakeEntity
        {
            #region Properties

            public string Value { get; set; }

            public string Value2 { get; set; }

            #endregion
        }

        class FakeFetch1 : FetchSpecification<FakeEntity>
        {
            public override Action<AdHocFetchSpecificationBase<FakeEntity>> FetchedBy()
            {
                return specification => specification.Join(r => r.Value);
            }
        }

        class FakeFetch2 : FetchSpecification<FakeEntity>
        {
            public override Action<AdHocFetchSpecificationBase<FakeEntity>> FetchedBy()
            {
                return specification => specification.Join(r => r.Value2);
            }
        }

        class FakeFetchAll : FetchSpecification<FakeEntity>
        {
            public override Action<AdHocFetchSpecificationBase<FakeEntity>> FetchedBy()
            {
                return specification => specification.Join(r => r.Value).Join(r => r.Value2);
            }
        }

        #endregion

        #region Establish value

        static FakeFetch1 fetch1;

        static FakeFetch2 fetch2;

        static FetchSpecification<FakeEntity> fetchAll;

        #endregion

        Establish establish = () =>
                                  {
                                      fetch1 = new FakeFetch1();
                                      fetch2 = new FakeFetch2();
                                  };

        Because of = () => { fetchAll = fetch1.And(fetch2); };

        It should_be_equal_all = () => fetchAll.Equals(new FakeFetchAll()).ShouldBeTrue();
    }
}