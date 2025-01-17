namespace Incoding.UnitTest.Block
{
    #region << Using >>

    using System;
    using Incoding.Block.Logging;
    using Machine.Specifications;

    #endregion

    [Behaviors]
    public class Behaviors_forward_ioc_provider : Context_IoC_Provider
    {
        It should_be_forward_to_instance = () =>
                                           {
                                               try
                                               {
                                                   ioCProvider.Forward<ILogger>(new FakeLogger());
                                                   ioCProvider.TryGet<ILogger>().ShouldBeAssignableTo<FakeLogger>();
                                               }
                                               catch (NotSupportedException) { }
                                           };

        #region Fake classes

        class FakeLogger : ILogger
        {
            #region ILogger Members

            public void Log(LogMessage logMessage) { }

            public ILogger WithTemplate(Func<LogMessage, string> func)
            {
                throw new NotImplementedException();
            }

            #endregion
        }

        #endregion
    }
}