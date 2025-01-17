﻿namespace Incoding.UnitTest.ExtensionsGroup
{
    #region << Using >>

    using System.Collections.Generic;
    using Incoding.Extensions;
    using Incoding.MSpecContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(DictionaryExtensions))]
    public class When_set_value_with_not_exists
    {
        #region Establish value

        static Dictionary<string, string> dictionary;

        #endregion

        Establish establish = () => { dictionary = new Dictionary<string, string>(); };

        Because of = () => dictionary.Set("Key", "Value");

        It should_be_added_new = () => dictionary.ShouldBeKeyValue("Key", "Value");
    }
}