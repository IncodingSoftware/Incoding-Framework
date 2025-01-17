namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using System.Collections.Specialized;
    using System.Web.Mvc;
    using Incoding.MSpecContrib;
    using Incoding.MvcContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(IncControllerBase))]
    public class When_inc_controller_base_try_push_success_with_custom : Context_inc_controller_base
    {
        Establish establish = () => httpContext.SetupGet(r => r.Request.Headers).Returns(new NameValueCollection());

        Because of = () => { result = controller.PushSuccessResult(new FakeCommand(), () => { return new EmptyResult(); }); };

        It should_be_custom = () => result.ShouldBeAssignableTo<EmptyResult>();

        It should_be_push = () => dispatcher.ShouldBePush(new FakeCommand());
    }
}