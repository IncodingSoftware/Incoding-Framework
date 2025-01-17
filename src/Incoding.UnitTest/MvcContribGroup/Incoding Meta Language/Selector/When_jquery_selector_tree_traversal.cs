﻿namespace Incoding.UnitTest.MvcContribGroup
{
    #region << Using >>

    using Incoding.Extensions;
    using Incoding.MvcContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(JquerySelectorExtendTreeTraversalExtensions))]
    public class When_jquery_selector_tree_traversal
    {
        It should_be_add = () => Selector.Jquery
                                         .Self()
                                         .Add(selector => selector.Tag(HtmlTag.Area)).ToString()
                                         .ShouldEqual("$(this.self).add('area')");

        It should_be_add_b = () => Selector.Jquery
                                           .Self()
                                           .Add(B.Active).ToString()
                                           .ShouldEqual("$(this.self).add('.active')");

        It should_be_add_selector = () => Selector.Jquery
                                                  .Self()
                                                  .Add(Selector.Jquery.Tag(HtmlTag.Area)).ToString()
                                                  .ShouldEqual("$(this.self).add('area')");

        It should_be_children = () => Selector.Jquery
                                              .Self()
                                              .Children(selector => selector.Tag(HtmlTag.Area)).ToString()
                                              .ShouldEqual("$(this.self).children('area')");

        It should_be_children_with_null = () => Selector.Jquery
                                                        .Self()
                                                        .Children().ToString()
                                                        .ShouldEqual("$(this.self).children()");

        It should_be_children_without_selector = () => Selector.Jquery
                                                               .Self()
                                                               .Children(HtmlTag.A).ToString()
                                                               .ShouldEqual("$(this.self).children('a')");

        It should_be_closest = () => Selector.Jquery
                                             .Self()
                                             .Closest(selector => selector.Tag(HtmlTag.Area)).ToString()
                                             .ShouldEqual("$(this.self).closest('area')");

        It should_be_closest_by_b = () => Selector.Jquery
                                                  .Self()
                                                  .Closest(B.Active).ToString()
                                                  .ShouldEqual("$(this.self).closest('.active')");

        It should_be_closest_by_expression = () => Selector.Jquery
                                                           .Self()
                                                           .Closest(JqueryExpression.Checked).ToString()
                                                           .ShouldEqual("$(this.self).closest(':checked')");

        It should_be_closest_by_selector = () => Selector.Jquery
                                                         .Self()
                                                         .Closest(Selector.Jquery.Tag(HtmlTag.Abbr)).ToString()
                                                         .ShouldEqual("$(this.self).closest('abbr')");

        It should_be_closest_by_tag = () => Selector.Jquery
                                                    .Self()
                                                    .Closest(HtmlTag.Abbr).ToString()
                                                    .ShouldEqual("$(this.self).closest('abbr')");

        It should_be_filter = () => Selector.Jquery
                                            .Self()
                                            .Filter(selector => selector.Tag(HtmlTag.Area)).ToString()
                                            .ShouldEqual("$(this.self).filter('area')");

        It should_be_filter_by_expression = () => Selector.Jquery
                                                          .Self()
                                                          .Filter(JqueryExpression.Checked).ToString()
                                                          .ShouldEqual("$(this.self).filter(':checked')");

        It should_be_filter_by_tag = () => Selector.Jquery
                                                   .Self()
                                                   .Filter(HtmlTag.Article).ToString()
                                                   .ShouldEqual("$(this.self).filter('article')");

        It should_be_find = () => Selector.Jquery
                                          .Self()
                                          .Find(selector => selector.Tag(HtmlTag.Area)).ToString()
                                          .ShouldEqual("$(this.self).find('area')");

        It should_be_find_by_b = () => Selector.Jquery
                                               .Self()
                                               .Find(B.Active).ToString()
                                               .ShouldEqual("$(this.self).find('.active')");

        It should_be_find_by_expression = () => Selector.Jquery
                                                        .Self()
                                                        .Find(JqueryExpression.Checked).ToString()
                                                        .ShouldEqual("$(this.self).find(':checked')");

        It should_be_find_by_tag = () => Selector.Jquery
                                                 .Self()
                                                 .Find(HtmlTag.Area).ToString()
                                                 .ShouldEqual("$(this.self).find('area')");

        It should_be_multiple_tree = () => Selector.Jquery
                                                   .Self()
                                                   .Add(selector => selector.Tag(HtmlTag.Area))
                                                   .Parents()
                                                   .Closest(selector => selector.Tag(HtmlTag.Tr))
                                                   .ToString()
                                                   .ShouldEqual("$(this.self).add('area').parents().closest('tr')");

        It should_be_next = () => Selector.Jquery
                                          .Self()
                                          .Next(selector => selector.Tag(HtmlTag.Area)).ToString()
                                          .ShouldEqual("$(this.self).next('area')");

        It should_be_next_all = () => Selector.Jquery
                                              .Self()
                                              .NextAll(selector => selector.Tag(HtmlTag.Area)).ToString()
                                              .ShouldEqual("$(this.self).nextAll('area')");

        It should_be_next_all_without_selector = () => Selector.Jquery
                                                               .Self()
                                                               .NextAll().ToString()
                                                               .ShouldEqual("$(this.self).nextAll()");

        It should_be_next_until = () => Selector.Jquery
                                                .Self()
                                                .NextUntil(selector => selector.Tag(HtmlTag.Area)).ToString()
                                                .ShouldEqual("$(this.self).nextUntil('area')");

        It should_be_next_until_without_selector = () => Selector.Jquery
                                                                 .Self()
                                                                 .NextUntil().ToString()
                                                                 .ShouldEqual("$(this.self).nextUntil()");

        It should_be_next_with_tag = () => Selector.Jquery
                                                           .Self()
                                                           .Next(HtmlTag.Area).ToString()
                                                           .ShouldEqual("$(this.self).next('area')");

        It should_be_next_with_b = () => Selector.Jquery
                                                           .Self()
                                                           .Next(B.Active).ToString()
                                                           .ShouldEqual("$(this.self).next('.active')");


        It should_be_next_without_selector = () => Selector.Jquery
                                                           .Self()
                                                           .Next().ToString()
                                                           .ShouldEqual("$(this.self).next()");

        It should_be_not = () => Selector.Jquery.All()
                                         .Not(selector => selector.Tag(HtmlTag.P))
                                         .ToString()
                                         .ShouldEqual("$('*').not('p')");

        It should_be_not_by_selector = () => Selector.Jquery.All()
                                         .Not("Id".ToId())
                                         .ToString()
                                         .ShouldEqual("$('*').not('#Id')");

        It should_be_not_by_expression = () => Selector.Jquery.All()
                                                       .Not(JqueryExpression.Button)
                                                       .ToString()
                                                       .ShouldEqual("$('*').not(':button')");

        It should_be_not_by_tag = () => Selector.Jquery.All()
                                                .Not(HtmlTag.P)
                                                .ToString()
                                                .ShouldEqual("$('*').not('p')");

        It should_be_not_simple_selector = () => Selector.Jquery.Self()
                                                         .Filter(r => r.Self().Parent())
                                                         .ToString()
                                                         .ShouldEqual("$(this.self).filter($(this.self).parent())");

        It should_be_offset_parent = () => Selector.Jquery
                                                   .Self()
                                                   .OffsetParent().ToString()
                                                   .ShouldEqual("$(this.self).offsetParent()");

        It should_be_parent = () => Selector.Jquery
                                            .Self()
                                            .Parent(selector => selector.Tag(HtmlTag.Area)).ToString()
                                            .ShouldEqual("$(this.self).parent('area')");

        It should_be_parent_without_selector = () => Selector.Jquery
                                                             .Self()
                                                             .Parent()
                                                             .ToString()
                                                             .ShouldEqual("$(this.self).parent()");


        It should_be_parent_with_b = () => Selector.Jquery
                                                             .Self()
                                                             .Parent(B.Active)
                                                             .ToString()
                                                             .ShouldEqual("$(this.self).parent('.active')");

        It should_be_parents = () => Selector.Jquery
                                             .Self()
                                             .Parents(HtmlTag.Area).ToString()
                                             .ShouldEqual("$(this.self).parents('area')");

        It should_be_parents_until = () => Selector.Jquery
                                                   .Self()
                                                   .ParentsUntil().ToString()
                                                   .ShouldEqual("$(this.self).parentsUntil()");

        It should_be_parents_without_selector = () => Selector.Jquery
                                                              .Self()
                                                              .Parents(selector => selector.Tag(HtmlTag.Area)).ToString()
                                                              .ShouldEqual("$(this.self).parents('area')");

        It should_be_prev = () => Selector.Jquery
                                          .Self()
                                          .Prev(selector => selector.Tag(HtmlTag.Area)).ToString()
                                          .ShouldEqual("$(this.self).prev('area')");

        It should_be_prev_all = () => Selector.Jquery
                                              .Self()
                                              .PrevAll(selector => selector.Tag(HtmlTag.Area)).ToString()
                                              .ShouldEqual("$(this.self).prevAll('area')");

        It should_be_prev_all_without_selector = () => Selector.Jquery
                                                               .Self()
                                                               .PrevAll().ToString()
                                                               .ShouldEqual("$(this.self).prevAll()");

        It should_be_prev_until = () => Selector.Jquery
                                                .Self()
                                                .PrevUntil(selector => selector.Tag(HtmlTag.Area)).ToString()
                                                .ShouldEqual("$(this.self).prevUntil('area')");

        It should_be_prev_until_without_selector = () => Selector.Jquery
                                                                 .Self()
                                                                 .PrevUntil().ToString()
                                                                 .ShouldEqual("$(this.self).prevUntil()");

        It should_be_prev_without_selector = () => Selector.Jquery
                                                           .Self()
                                                           .Prev().ToString()
                                                           .ShouldEqual("$(this.self).prev()");

        It should_be_siblings = () => Selector.Jquery
                                              .Self()
                                              .Siblings(selector => selector.Tag(HtmlTag.Area)).ToString()
                                              .ShouldEqual("$(this.self).siblings('area')");

        It should_be_siblings_by_b = () => Selector.Jquery
                                                   .Self()
                                                   .Siblings(B.Hidden).ToString()
                                                   .ShouldEqual("$(this.self).siblings('.hidden')");

        It should_be_siblings_by_tag = () => Selector.Jquery
                                                     .Self()
                                                     .Siblings(HtmlTag.Tr).ToString()
                                                     .ShouldEqual("$(this.self).siblings('tr')");

        It should_be_siblings_without_selector = () => Selector.Jquery
                                                               .Self()
                                                               .Siblings().ToString()
                                                               .ShouldEqual("$(this.self).siblings()");

        It should_be_slice = () => Selector.Jquery
                                           .Self()
                                           .Slice(1, 5).ToString()
                                           .ShouldEqual("$(this.self).slice(1,5)");

        It should_be_slice_with_incoding_selector = () => Selector.Jquery
                                                                  .Self()
                                                                  .Slice(Selector.Incoding.HashQueryString("test")).ToString()
                                                                  .ShouldEqual("$(this.self).slice(||hashQueryString*test:root||,0)");

        It should_be_slice_with_jquery_selector = () => Selector.Jquery
                                                                .Self()
                                                                .Slice(Selector.Jquery.Self()).ToString()
                                                                .ShouldEqual("$(this.self).slice($(this.self),0)");

        It should_be_slice_without_end = () => Selector.Jquery
                                                       .Self()
                                                       .Slice(1).ToString()
                                                       .ShouldEqual("$(this.self).slice(1,0)");
    }
}