﻿namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using Incoding.MSpecContrib;
    using Incoding.MvcContrib.MVD;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(DispatcherControllerBase))]
    public class When_base_dispatcher_controller_query_to_file_with_empty_content_type : Context_dispatcher_controller
    {
        #region Establish value

        static byte[] content;

        #endregion

        Establish establish = () =>
                              {
                                  var query = Pleasure.Generator.Invent<FakeFileByNameQuery>();
                                  dispatcher.StubQuery(Pleasure.Generator.Invent<CreateByTypeQuery>(dsl => dsl.Tuning(r => r.ControllerContext, controller.ControllerContext)
                                                                                                                   .Tuning(r => r.ModelState, controller.ModelState)
                                                                                                                   .Empty(r => r.IsModel)
                                                                                                                   .Empty(r => r.IsGroup)
                                                                                                                   .Tuning(r => r.Type, typeof(FakeFileByNameQuery).Name)), (object)query);

                                  content = Pleasure.Generator.Bytes();
                                  dispatcher.StubQuery(Pleasure.Generator.Invent<ExecuteQuery>(dsl => dsl.Tuning(r => r.Instance, query)), (object)content);                                  
                                  responseBase.Setup(r => r.AddHeader("X-Download-Options", "Open"));
                              };

        Because of = () => { result = controller.QueryToFile(typeof(FakeFileByNameQuery).Name, string.Empty, Pleasure.Generator.TheSameString()); };

        It should_be_verify = () => { responseBase.VerifyAll(); };

        It should_be_result = () => result.ShouldBeFileContent(content,
                                                               contentType: "img",
                                                               fileDownloadName: Pleasure.Generator.TheSameString());
        
    }
}