﻿namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using Incoding.MvcContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(IncHiddenControl<,>))]
    public class When_inc_radio_button_control_unchecked : Context_inc_control
    {
        Because of = () =>
                         {
                             result = new IncodingHtmlHelperFor<FakeModel, object>(mockHtmlHelper.Original, r => r.Prop)
                                     .RadioButton(boxControl =>
                                                  {
                                                      boxControl.Value = "Male";
                                                  });
                         };

        It should_be_render = () => result.ToString()
                                          .ShouldEqual("<div class=\"radio\"><label><input id=\"Prop\" name=\"Prop\" type=\"radio\" value=\"Male\" /><i></i><span>Male</span></label></div>");
    }
}