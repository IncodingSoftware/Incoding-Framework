namespace Incoding.UnitTest.MvcContribGroup
{
    using System.Linq;
    using Incoding.MSpecContrib;
    using Incoding.MvcContrib;
    using Machine.Specifications;

    [Subject(typeof(IncodingMetaLanguageDsl))]
    public class When_incoding_meta_language_dsl_more_when_without_on_3
    {
        #region Establish value

        static IIncodingMetaLanguageEventBuilderDsl metaBuilder;

        #endregion

        Because of = () =>
                     {
                         metaBuilder = new IncodingMetaLanguageDsl(JqueryBind.Click)
                                 .When(JqueryBind.Blur)
                                 .When("load")
                                 .Ajax("url")
                                 .OnSuccess(r => r.Self().Core().Eval(Pleasure.Generator.TheSameString()));
                     };

        It should_be_action_when_load = () => metaBuilder
                                                      .GetAll<ExecutableAjaxAction>()
                                                      .SingleOrDefault(r => r["onBind"].ToString() == "load incoding")
                                                      .ShouldNotBeNull();

        It should_be_callback_when_load = () => metaBuilder
                                                        .GetAll<ExecutableEval>()
                                                        .SingleOrDefault(r => r["onBind"].ToString() == "load incoding")
                                                        .ShouldNotBeNull();

        It should_be_count = () => { metaBuilder.GetAll<ExecutableBase>().Count().ShouldEqual(2); };
    }
}