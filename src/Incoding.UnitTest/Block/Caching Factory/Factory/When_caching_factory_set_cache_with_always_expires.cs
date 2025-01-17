namespace Incoding.UnitTest.Block
{
    #region << Using >>

    using Incoding.Block.Caching;
    using Incoding.MSpecContrib;
    using Machine.Specifications;

    #endregion

    [Subject(typeof(CachingFactory))]
    public class When_caching_factory_set_cache_with_always_expires
    {
        #region Establish value

        static CachingFactory cachingFactory;

        #endregion

        Establish establish = () =>
                                  {
                                      cachingFactory = new CachingFactory();
                                      cachingFactory.Initialize(caching => caching
                                                                                   .WithPolicy(r=>r.ForDeepDerived<ICacheKey>().NeverExpires())
                                                                                   .WithProvider(new MemoryListCachedProvider()));
                                  };

        Because of = () => cachingFactory.Set(new FakeCacheKey(), Pleasure.Generator.Invent<FakeSerializeObject>());

        It should_be_get_without_callback = () => Pleasure.Do3((i) =>
                                                                   {
                                                                       var spy = Pleasure.Mock<ISpy>();
                                                                       cachingFactory.Retrieve(new FakeCacheKey(), () =>
                                                                                                                       {
                                                                                                                           spy.Object.Is();
                                                                                                                           return new FakeSerializeObject();
                                                                                                                       }).ShouldNotBeNull();
                                                                       spy.Never();
                                                                   });
    }
}