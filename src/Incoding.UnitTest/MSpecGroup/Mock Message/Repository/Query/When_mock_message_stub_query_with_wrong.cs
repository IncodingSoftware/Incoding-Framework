﻿namespace Incoding.UnitTest.MSpecGroup
{
    #region << Using >>

    using System;
    using System.Collections.Generic;
    using System.Linq.Expressions;
    using Incoding.Block;
    using Incoding.CQRS;
    using Incoding.Data;
    using Incoding.MSpecContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(MockMessage<,>))]
    public class When_mock_message_stub_query_with_wrong
    {
        #region Fake classes

        public class FakeEntity : IncEntityBase { }

        public class FakeFetchSpecification : FetchSpecification<FakeEntity>
        {
            public override Action<AdHocFetchSpecificationBase<FakeEntity>> FetchedBy()
            {
                return r => r.Join(entity => entity.Id);
            }
        }

        class FakeMockMessage : QueryBase<List<FakeEntity>>
        {
            #region Properties

            public string[] Param { get; set; }

            #endregion

            #region Override

            protected override List<FakeEntity> ExecuteResult()
            {
                var result = new List<FakeEntity>();

                result.AddRange(Repository.Query(whereSpecification: new EntitySpec1(Param[0])));
                result.AddRange(Repository.Query(whereSpecification: new EntitySpec1(Param[1])));

                return result;
            }

            #endregion
        }

        class EntitySpec1 : Specification<FakeEntity>
        {
            #region Fields

            readonly string param;

            #endregion

            #region Constructors

            public EntitySpec1(string param)
            {
                this.param = param;
            }

            #endregion

            public override Expression<Func<FakeEntity, bool>> IsSatisfiedBy()
            {
                return r => r.Id == this.param;
            }
        }

        #endregion

        #region Establish value

        static MockMessage<FakeMockMessage, List<FakeEntity>> mockMessage;

        static List<FakeEntity> expected;

        #endregion

        Establish establish = () =>
                                  {
                                      var fakeMockMessage = Pleasure.Generator.Invent<FakeMockMessage>(dsl => dsl.Tuning(r => r.Param, Pleasure.ToArray("vlad", "sergey")));

                                      expected = Pleasure.ToList(Pleasure.Generator.Invent<FakeEntity>(), Pleasure.Generator.Invent<FakeEntity>());

                                      mockMessage = MockQuery<FakeMockMessage, List<FakeEntity>>
                                              .When(fakeMockMessage)
                                              .StubQuery(whereSpecification: new EntitySpec1(fakeMockMessage.Param[0].Inverse()), 
                                                         entities: expected[0])
                                              .StubQuery(whereSpecification: new EntitySpec1(fakeMockMessage.Param[1].Inverse()), 
                                                         entities: expected[1]);
                                  };

        Because of = () => mockMessage.Original.Execute();

        It should_be_empty_result = () => mockMessage.ShouldBeIsResult(list => list.ShouldBeEmpty());
    }


}