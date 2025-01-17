﻿namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using System.Linq;
    using Incoding.MSpecContrib;
    using Incoding.MvcContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(IncodingMetaLanguageDsl))]
    public class When_incoding_meta_language_dsl_with
    {
        It should_be_multiple_with = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                   .OnSuccess(dsl => dsl.With(Selector.Jquery.Self().Closest(s => s.Tag(HtmlTag.Tr)))
                                                                        .With(r => r.Id("Next"))
                                                                        .Core().Form.Validation.Parse())
                                                   .GetAll<ExecutableValidationParse>()
                                                   .First()["target"]
                                                   .ShouldEqual("$(this.self).closest('tr').add('#Next')");

        It should_be_reset_target = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                  .Do()
                                                  .Direct()
                                                  .OnSuccess(dsl =>
                                                             {
                                                                 dsl.Self().Core().Form.Validation.Parse();
                                                                 dsl.WithId("Id").Core().Form.Validation.Refresh();
                                                                 dsl.WithClass("class").Core().Form.Reset();
                                                             })
                                                  .Should(dsl =>
                                                          {
                                                              dsl.GetAll<ExecutableValidationParse>()
                                                                 .First()["target"]
                                                                      .ShouldEqual("$(this.self)");

                                                              dsl.GetAll<ExecutableValidationRefresh>()
                                                                 .First()["target"]
                                                                      .ShouldEqual("||jquery*#Id||");

                                                              dsl.GetAll<ExecutableForm>()
                                                                 .First()["target"]
                                                                      .ShouldEqual("||jquery*.class||");
                                                          });

        It should_be_reset_target_after_action = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                               .Do()
                                                               .Direct()
                                                               .OnSuccess(dsl => dsl.Self().Core().Form.Validation.Parse())
                                                               .When(JqueryBind.Change)
                                                               .Do()
                                                               .Direct()
                                                               .OnSuccess(dsl => dsl.WithId("Id").Core().Form.Validation.Refresh())
                                                               .Should(dsl =>
                                                                       {
                                                                           dsl.GetAll<ExecutableValidationParse>()
                                                                              .First()["target"]
                                                                                   .ShouldEqual("$(this.self)");

                                                                           dsl.GetAll<ExecutableValidationRefresh>()
                                                                              .First()["target"]
                                                                                   .ShouldEqual("||jquery*#Id||");
                                                                       });

        It should_be_self = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                          .Do()
                                          .Direct()
                                          .OnSuccess(r => r.Self().Core().Form.Validation.Parse())
                                          .GetAll<ExecutableValidationParse>()
                                          .First()["target"]
                                          .ShouldEqual("$(this.self)");

        It should_be_with = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                          .Do()
                                          .Direct()
                                          .OnSuccess(dsl => dsl.With(Selector.Jquery.Self().Closest(s => s.Tag(HtmlTag.Tr))).Core().Form.Validation.Parse())
                                          .GetAll<ExecutableValidationParse>()
                                          .First()["target"]
                                          .ShouldEqual("$(this.self).closest('tr')");

        It should_be_with_action = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                 .Do()
                                                 .Direct()
                                                 .OnSuccess(dsl => dsl.With(r => r.Self().Closest(s => s.Tag(HtmlTag.Tr))).Core().Form.Validation.Parse())
                                                 .GetAll<ExecutableValidationParse>()
                                                 .First()["target"]
                                                 .ShouldEqual("$(this.self).closest('tr')");

        It should_be_with_class = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                .Do()
                                                .Direct()
                                                .OnSuccess(dsl => dsl.WithClass("red").Core().Form.Validation.Parse())
                                                .GetAll<ExecutableValidationParse>()
                                                .First()["target"]
                                                .ShouldEqual("||jquery*.red||");

        It should_be_with_class_b = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                  .Do()
                                                  .Direct()
                                                  .OnSuccess(dsl => dsl.WithClass(B.Active).Core().Form.Validation.Parse())
                                                  .GetAll<ExecutableValidationParse>()
                                                  .First()["target"]
                                                  .ShouldEqual("||jquery*.active||");

        It should_be_with_id = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                             .Do()
                                             .Direct()
                                             .OnSuccess(dsl => dsl.WithId("id").Core().Form.Validation.Parse())
                                             .GetAll<ExecutableValidationParse>()
                                             .First()["target"]
                                             .ShouldEqual("||jquery*#id||");

        It should_be_with_id_expression = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                        .Do()
                                                        .Direct()
                                                        .OnSuccess(dsl => dsl.WithId<KeyValueVm>(vm => vm.Value).Core().Form.Validation.Parse())
                                                        .GetAll<ExecutableValidationParse>()
                                                        .First()["target"]
                                                        .ShouldEqual("||jquery*#Value||");

        It should_be_with_name = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                               .Do()
                                               .Direct()
                                               .OnSuccess(dsl => dsl.WithName("Value").Core().Form.Validation.Parse())
                                               .GetAll<ExecutableValidationParse>()
                                               .First()["target"]
                                               .ShouldEqual(@"||jquery*[name=""Value""]||");

        It should_be_with_name_expression = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                          .OnSuccess(dsl => dsl.WithName<KeyValueVm>(vm => vm.Value).Core().Form.Validation.Parse())
                                                          .GetAll<ExecutableValidationParse>()
                                                          .First()["target"]
                                                          .ShouldEqual(@"||jquery*[name=""Value""]||");

        It should_be_with_self = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                               .Do()
                                               .Direct()
                                               .OnSuccess(dsl => dsl.WithSelf(extend => extend.Closest(s => s.Tag(HtmlTag.Tr))).Core().Form.Validation.Parse())
                                               .GetAll<ExecutableValidationParse>()
                                               .First()["target"]
                                               .ShouldEqual("$(this.self).closest('tr')");

        It should_be_with_self_and_self = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                        .Do()
                                                        .Direct()
                                                        .OnSuccess(dsl => dsl
                                                                                  .WithSelf(s => s.Closest(HtmlTag.Li).Find(HtmlTag.Input))
                                                                                  .Self()
                                                                                  .Form.Validation.Parse())
                                                        .GetAll<ExecutableValidationParse>()
                                                        .First()["target"]
                                                        .ShouldEqual("$(this.self).closest('li').find('input').add($(this.self))");

        It should_be_with_self_multiple_level = () => new IncodingMetaLanguageDsl(JqueryBind.Click)
                                                              .Do()
                                                              .Direct()
                                                              .OnSuccess(dsl => dsl.WithSelf(r => r.Closest(selector => selector.Class("group")).Find(s => s.Class("help"))).Form.Validation.Parse())
                                                              .GetAll<ExecutableValidationParse>()
                                                              .First()["target"]
                                                              .ShouldEqual("$(this.self).closest('.group').find('.help')");
    }
}