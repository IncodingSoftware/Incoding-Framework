﻿namespace Incoding.UnitTest
{
    #region << Using >>

    using System.Data;
    using Incoding.CQRS;
    using Incoding.MSpecContrib;
    using Machine.Specifications;
    using Moq;
    using It = Machine.Specifications.It;

    #endregion

    [Subject(typeof(DefaultDispatcher))]
    public class When_default_dispatcher_push_composite_commands : Context_default_dispatcher
    {
        #region Establish value

        static CommandComposite composite;

        #endregion

        Establish establish = () =>
                              {
                                  composite = new CommandComposite();
                                  composite.Quote(Pleasure.Generator.Invent<CommandWithRepository>());
                                  composite.Quote(Pleasure.Generator.Invent<CommandWithRepository>());
                              };

        Because of = () => dispatcher.Push(composite);

        It should_be_committed = () => unitOfWorkFactory.Verify(r => r.Create(IsolationLevel.ReadCommitted, true, Pleasure.MockIt.IsNull<string>()), Times.Once());

        It should_be_disposable = () => unitOfWork.Verify(r => r.Dispose(), Times.Once());

        It should_be_flush = () => unitOfWork.Verify(r => r.Flush(), Times.AtLeast(2));
    }
}