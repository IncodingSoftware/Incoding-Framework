﻿namespace Incoding.MvcContrib.MVD
{
    #region << Using >>

    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Reflection;
    using System.Web;
    using System.Web.Mvc;
    using Incoding.CQRS;
    using Incoding.Extensions;

    #endregion

    public class CreateByTypeQuery : QueryBase<object>
    {       
       static  readonly  Dictionary<string,Delegate>  cached = new Dictionary<string, Delegate>();

        protected override object ExecuteResult()
        {
            var byPair = Type.Split(UrlDispatcher.separatorByPair.ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
            string genericType = byPair.ElementAtOrDefault(1);

            var inst = Dispatcher.Query(new FindTypeByName()
                                        {
                                                Type = byPair[0],
                                        });
            var formCollection = Dispatcher.Query(new GetFormCollectionsQuery());
            var instanceType = IsGroup ? typeof(List<>).MakeGenericType(inst) : inst;
            if (instanceType.IsTypicalType() && IsModel)
            {
                string str = formCollection["incValue"];
                if (instanceType == typeof(string))
                    return str;
                if (instanceType == typeof(bool))
                    return bool.Parse(str);
                if (instanceType == typeof(DateTime))
                    return DateTime.Parse(str);
                if (instanceType == typeof(int))
                    return int.Parse(str);
                if (instanceType.IsEnum)
                    return Enum.Parse(instanceType, str);
            }
            else if (!string.IsNullOrWhiteSpace(genericType))
            {
                instanceType = instanceType.MakeGenericType(genericType.Split(UrlDispatcher.separatorByGeneric.ToCharArray(), StringSplitOptions.RemoveEmptyEntries)
                                                                       .Select(name => Dispatcher.Query(new FindTypeByName()
                                                                                                        {
                                                                                                                Type = name,
                                                                                                        }))
                                                                       .ToArray());
            }

            Func<object> modelAccessor = () => cached.GetOrAdd(instanceType.FullName, () => Expression.Lambda(typeof(Func<object>), Expression.New(instanceType.GetConstructors().First()), true).Compile()).DynamicInvoke();
            return new DefaultModelBinder().BindModel(ControllerContext ?? new ControllerContext(), new ModelBindingContext()
                                                                                                    {
                                                                                                            ModelMetadata = ModelMetadataProviders.Current.GetMetadataForType(modelAccessor, instanceType),
                                                                                                            ModelState = ModelState ?? new ModelStateDictionary(),
                                                                                                            ValueProvider = formCollection
                                                                                                    });
        }

        #region Nested classes

        public class FindTypeByName : QueryBase<Type>
        {
            #region Static Fields

            static readonly Dictionary<string, string> cache = new Dictionary<string, string>();

            #endregion

            #region Fields

            public string Type { get; set; }

            #endregion

            protected override Type ExecuteResult()
            {
                string name = HttpUtility.UrlDecode(Type).Replace(" ", "+");
                var assmelbyName = cache.GetOrAdd(name, () =>
                                                        {
                                                            var clearName = name.Contains("`") ? name.Split('`')[0] + "`1" : name;
                                                            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
                                                            {
                                                                var findType = assembly.GetLoadableTypes().FirstOrDefault(type => type.Name == clearName || type.FullName == clearName);
                                                                if (findType != null)
                                                                    return findType.AssemblyQualifiedName;
                                                            }

                                                            throw new IncMvdException("Not found any type {0}".F(name));
                                                        });
                return System.Type.GetType(assmelbyName);
            }
        }

        #endregion

        public class GetFormCollectionsQuery : QueryBase<FormCollection>
        {
            protected override FormCollection ExecuteResult()
            {
                var request = HttpContext.Current.Request;
                var formAndQuery = new FormCollection(request.Form);
                formAndQuery.Add(request.QueryString);
                return formAndQuery;
            }
        }

        #region Properties

        public string Type { get; set; }

        public bool IsGroup { get; set; }

        public bool IsModel { get; set; }

        public ModelStateDictionary ModelState { get; set; }

        public ControllerContext ControllerContext { get; set; }

        #endregion
    }
}