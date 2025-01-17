﻿namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Reflection;
    using Incoding.MSpecContrib;
    using Incoding.MvcContrib;
    using Incoding.MvcContrib.MVD;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(CreateByTypeQuery.FindTypeByName))]
    public class When_find_by_type_performance
    {
        It should_be_full_name = () =>
                                 {
                                     var message = MockQuery<CreateByTypeQuery.FindTypeByName, Type>
                                             .When(Pleasure.Generator.Invent<CreateByTypeQuery.FindTypeByName>(dsl => dsl.Tuning(r => r.Type, typeof(When_find_by_type_performanceCommand).FullName)));
                                     Pleasure.Do(i =>
                                                 {
                                                     message.Execute();
                                                     message.ShouldBeIsResult(typeof(When_find_by_type_performanceCommand));
                                                 }, 1000)
                                             .ShouldBeLessThan(1000);
                                 };

        It should_be_name = () =>
                            {
                                var message = MockQuery<CreateByTypeQuery.FindTypeByName, Type>
                                        .When(Pleasure.Generator.Invent<CreateByTypeQuery.FindTypeByName>(dsl => dsl.Tuning(r => r.Type, typeof(When_find_by_type_performanceCommand).Name)));
                                Pleasure.Do(i =>
                                            {
                                                message.Execute();
                                                message.ShouldBeIsResult(typeof(When_find_by_type_performanceCommand));
                                            }, 1000)
                                        .ShouldBeLessThan(500);
                            };

        It should_be_name_with_preload = () =>
                                         {
                                             var message = MockQuery<CreateByTypeQuery.FindTypeByName, Type>
                                                     .When(Pleasure.Generator.Invent<CreateByTypeQuery.FindTypeByName>(dsl => dsl.Tuning(r => r.Type, typeof(When_find_by_type_performanceCommand).Name)));
                                             Action<int> action = i =>
                                                                  {
                                                                      message.Execute();
                                                                      message.ShouldBeIsResult(typeof(When_find_by_type_performanceCommand));
                                                                  };
                                             var dictionary = new ConcurrentDictionary<string, string>();
                                             dictionary.TryAdd(typeof(When_find_by_type_performanceCommand).Name, typeof(When_find_by_type_performanceCommand).AssemblyQualifiedName);
                                             typeof(CreateByTypeQuery.FindTypeByName).GetField("cache", BindingFlags.Static | BindingFlags.NonPublic).SetValue(null, dictionary);

                                             Pleasure.Do(action, 1000).ShouldBeLessThan(75);
                                         };


        public class When_find_by_type_performanceCommand { }
    }
}