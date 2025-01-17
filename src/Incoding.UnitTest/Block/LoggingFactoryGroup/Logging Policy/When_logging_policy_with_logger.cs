namespace Incoding.UnitTest.Block
{
    #region << Using >>

    using Incoding.Block.Logging;
    using Incoding.MSpecContrib;
    using Machine.Specifications;
    using Moq;
    using It = Machine.Specifications.It;

    #endregion

    [Subject(typeof(LoggingPolicy))]
    public class When_logging_policy_with_logger : Context_Logging_Policy
    {
        Establish establish = () =>
                                  {
                                      loggingPolicy = new LoggingPolicy();
                                      loggingPolicy.For(new[]
                                                            {
                                                                    LogType.Debug,
                                                                    LogType.Trace
                                                            }).Use(defaultMockLogger.Object);
                                  };

        Because of = () => loggingPolicy.Log(LogType.Debug, new LogMessage(Pleasure.Generator.String(), null, null));

        It should_be_log = () => defaultMockLogger.Verify(r => r.Log(Moq.It.IsAny<LogMessage>()), Times.Once());
    }
}