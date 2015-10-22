﻿namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using Incoding.MSpecContrib;
    using Incoding.MvcContrib.MVD;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(DispatcherControllerBase))]
    public class When_base_dispatcher_controller_query_by_full_name : Context_dispatcher_controller
    {
        #region Establish value

        static string queryResult;

        #endregion

        Establish establish = () =>
                              {
                                  Establish(types: new[] { typeof(ShareQuery) });
                                  queryResult = Pleasure.Generator.String();
                                  dispatcher.StubQuery(new ShareQuery(), queryResult);
                              };

        Because of = () => { result = controller.Query(typeof(ShareQuery).FullName, false); };

        It should_be_result = () => result.ShouldBeIncodingSuccess<string>(s => s.ShouldEqual(queryResult));
    }
}