﻿namespace Incoding.UnitTest.MSpecGroup
{
    #region << Using >>

    using Incoding.CQRS;
    using Incoding.Data;
    using Incoding.MSpecContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(MockMessage<,>))]
    public class When_mock_message_should_be_repository
    {
        #region Fake classes

        class FakeEntity : IncEntityBase
        {
            #region Constructors

            public FakeEntity() { }

            public FakeEntity(string id)
            {
                Id = id;
                Field = id;
            }

            #endregion

            // ReSharper disable MemberCanBePrivate.Local
            #region Properties

            public string Field { get; set; }

            #endregion

            // ReSharper restore MemberCanBePrivate.Local
        }

        class FakeNewEntity : IncEntityBase { }

        class FakeCommand : CommandBase
        {
            protected override void Execute()
            {
                Repository.Save(new FakeEntity(Pleasure.Generator.TheSameString()));
                Repository.Save(new FakeEntity(Pleasure.Generator.String()));

                Repository.Saves(new[]
                                 {
                                         new FakeEntity("1"), 
                                         new FakeEntity("2"), 
                                 });

                Repository.SaveOrUpdate(new FakeEntity(Pleasure.Generator.TheSameString()));
                Repository.SaveOrUpdate(new FakeEntity(Pleasure.Generator.String()));

                Repository.Delete<FakeEntity>(Pleasure.Generator.TheSameString());
                Repository.Delete<FakeEntity>(Pleasure.Generator.TheSameString());

                Repository.Flush();
                Repository.Flush();

                Repository.DeleteAll<FakeEntity>();
                Repository.DeleteByIds<FakeEntity>(new object[] { 1, 2, 3 });
            }
        }

        #endregion

        #region Establish value

        static MockMessage<FakeCommand, object> mockMessage;

        #endregion

        Establish establish = () =>
                              {
                                  mockMessage = MockCommand<FakeCommand>
                                          .When(Pleasure.Generator.Invent<FakeCommand>());
                              };

        Because of = () => mockMessage.Original.Execute();

        It should_be_save_with_times = () => mockMessage.ShouldBeSave<FakeEntity>(entity => entity.ShouldNotBeNull(), 2);

        It should_be_save_entity = () => mockMessage.ShouldBeSave(new FakeEntity(Pleasure.Generator.TheSameString()));

        It should_be_save = () => mockMessage.ShouldBeSave<FakeEntity>(entity => entity.ShouldNotBeNull(), 2);

        It should_be_saves = () => mockMessage.ShouldBeSaves<FakeEntity>(entities => entities.ShouldEqualWeakEach(new[] { new FakeEntity("1"), new FakeEntity("2") }));

        It should_be_flush = () => mockMessage.ShouldBeFlush(2);

        It should_be_save_or_update_with_times = () => mockMessage.ShouldBeSaveOrUpdate<FakeEntity>(entity => entity.ShouldNotBeNull(), 2);

        It should_be_save_or_update_entity = () => mockMessage.ShouldBeSaveOrUpdate(new FakeEntity(Pleasure.Generator.TheSameString()));

        It should_be_save_or_update = () => mockMessage.ShouldBeSaveOrUpdate<FakeEntity>(entity => entity.ShouldNotBeNull(), 2);

        It should_be_delete_by_id = () => mockMessage.ShouldBeDelete<FakeEntity>(Pleasure.Generator.TheSameString(), callCount: 2);

        It should_be_not_save = () => mockMessage.ShouldNotBeSave<FakeNewEntity>();

        It should_be_not_save_or_update = () => mockMessage.ShouldNotBeSaveOrUpdate<FakeNewEntity>();

        It should_be_delete_all = () => mockMessage.ShouldBeDeleteAll<FakeEntity>();

        It should_be_delete_by_ids = () => mockMessage.ShouldBeDeleteByIds<FakeEntity>(new object[] { 1, 2, 3 });
    }
}