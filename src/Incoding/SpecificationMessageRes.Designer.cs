﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.18449
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Incoding {
    using System;
    
    
    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "4.0.0.0")]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    public class SpecificationMessageRes {
        
        private static global::System.Resources.ResourceManager resourceMan;
        
        private static global::System.Globalization.CultureInfo resourceCulture;
        
        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
        internal SpecificationMessageRes() {
        }
        
        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        public static global::System.Resources.ResourceManager ResourceManager {
            get {
                if (object.ReferenceEquals(resourceMan, null)) {
                    global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("Incoding.SpecificationMessageRes", typeof(SpecificationMessageRes).Assembly);
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }
        
        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        public static global::System.Globalization.CultureInfo Culture {
            get {
                return resourceCulture;
            }
            set {
                resourceCulture = value;
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Actual count expressions {0} but expected {1}.
        /// </summary>
        public static string AdHocFetchSpecification_Equal_diffrent_count_expressions {
            get {
                return ResourceManager.GetString("AdHocFetchSpecification_Equal_diffrent_count_expressions", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Actual expression {0} but expected {1}.
        /// </summary>
        public static string AdHocFetchSpecification_Equal_diffrent_expressions {
            get {
                return ResourceManager.GetString("AdHocFetchSpecification_Equal_diffrent_expressions", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Actual count expressions {0} but expected {1}.
        /// </summary>
        public static string AdHocOrderSpecification_Equal_diffrent_count_expressions {
            get {
                return ResourceManager.GetString("AdHocOrderSpecification_Equal_diffrent_count_expressions", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Actual expression {0} but expected {1}.
        /// </summary>
        public static string AdHocOrderSpecification_Equal_diffrent_expressions {
            get {
                return ResourceManager.GetString("AdHocOrderSpecification_Equal_diffrent_expressions", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Actual type {0} but expected {1}.
        /// </summary>
        public static string AdHocOrderSpecification_Equal_diffrent_type {
            get {
                return ResourceManager.GetString("AdHocOrderSpecification_Equal_diffrent_type", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Actual {0} null but Expected {1} null.
        /// </summary>
        public static string CompareFactory_Actual_Null_Or_Expected_Null {
            get {
                return ResourceManager.GetString("CompareFactory_Actual_Null_Or_Expected_Null", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Property {0} should be has configuration one once.
        /// </summary>
        public static string CompareFactory_Has_Many_Configuration {
            get {
                return ResourceManager.GetString("CompareFactory_Has_Many_Configuration", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Not found property {0} in class {1}.
        /// </summary>
        public static string CompareFactory_Not_Found_Property {
            get {
                return ResourceManager.GetString("CompareFactory_Not_Found_Property", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to &quot;Database access logic cannot be used, if session not opened. Implicitly session usage not allowed now. Please open session&quot;.
        /// </summary>
        public static string Session_Factory_Not_Open {
            get {
                return ResourceManager.GetString("Session_Factory_Not_Open", resourceCulture);
            }
        }
    }
}
