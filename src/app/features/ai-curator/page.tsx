import React from 'react';
import { Metadata } from 'next';
import { 
  Search, 
  Bell, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RefreshCcw, 
  MessageCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'AI 艺术策展人 - PetPixel',
  description: '您的专属 24/7 智能艺术顾问',
};

export default function AiCuratorPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-stone-50 z-0" />
        <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12">
           <Sparkles className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>全新上线</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-stone-900 mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            您的专属 <span className="text-primary relative inline-block">
              AI 艺术策展人
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            24/7 在线，懂艺术，更懂你。<br/>
            无论是寻找灵感、追踪订单，还是售后咨询，只需一句话。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button size="lg" className="rounded-full px-8 text-lg h-14 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1">
              立即体验
              <MessageCircle className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-stone-400 mt-2 sm:mt-0">
              * 点击右下角气泡开始对话
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-4">全能助手，无所不能</h2>
            <p className="text-lg text-stone-500">探索 PetPixel 智能助手的六大核心能力</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="w-6 h-6" />}
              title="智能搜图"
              desc="描述你想要的画面，AI 为你寻找完美的艺术品。"
              example='"有没有适合挂在客厅的猫咪油画？"'
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={<Bell className="w-6 h-6" />}
              title="价格与补货提醒"
              desc="关注商品缺货或降价时，第一时间通知你。"
              example='"这个画框补货了能通知我吗？"'
              color="bg-amber-50 text-amber-600"
            />
            <FeatureCard 
              icon={<ShoppingBag className="w-6 h-6" />}
              title="订单管家"
              desc="随时查询历史订单，无需繁琐翻阅。"
              example='"查一下我最近买了什么"'
              color="bg-purple-50 text-purple-600"
            />
            <FeatureCard 
              icon={<Truck className="w-6 h-6" />}
              title="物流追踪"
              desc="实时掌握爱宠画作的运输状态。"
              example='"我的画发货了吗？"'
              color="bg-green-50 text-green-600"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="售后无忧"
              desc="自动检查退换货资格，政策一目了然。"
              example='"订单 #12345 还能退吗？"'
              color="bg-rose-50 text-rose-600"
            />
            <FeatureCard 
              icon={<RefreshCcw className="w-6 h-6" />}
              title="一键退换"
              desc="对话中直接提交申请，省去复杂流程。"
              example='"帮我提交退货申请"'
              color="bg-orange-50 text-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Demo Conversation Section */}
      <section className="py-24 bg-stone-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                自然对话，<br/>就像和朋友聊天
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                无需学习复杂的指令。我们的 AI 助手理解自然语言，甚至能听懂“温馨”、“大气”等抽象风格描述（即将上线）。
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">全天候在线</h3>
                    <p className="text-stone-500">无论是深夜寻找灵感，还是清晨查询物流，随时待命。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">个性化推荐</h3>
                    <p className="text-stone-500">根据您的历史偏好和当前需求，提供量身定制的建议。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">快速解决问题</h3>
                    <p className="text-stone-500">从查询到售后，一站式解决，无需跳转多个页面。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat UI Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-200 rounded-3xl blur-2xl opacity-50 transform rotate-3"></div>
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10">
                <div className="bg-stone-100 p-4 border-b border-stone-200 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 font-medium text-stone-600 text-sm">PetPixel Curator</div>
                </div>
                <div className="p-6 space-y-6 h-[400px] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                  
                  {/* Message 1 */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%]">
                      我想找一幅挂在书房的画，要安静一点的感觉。
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex justify-start">
                    <div className="bg-stone-100 text-stone-800 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                      明白。对于书房，我推荐色彩柔和、构图简洁的作品。这里有几幅“阅读中的猫咪”系列，采用莫兰迪色系，非常适合营造宁静的氛围。👇
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="flex justify-start">
                     <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-sm max-w-[70%]">
                        <div className="h-24 bg-stone-200 rounded-lg mb-2 animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-stone-200 rounded mb-1"></div>
                        <div className="h-3 w-1/2 bg-stone-100 rounded"></div>
                     </div>
                  </div>

                   {/* Message 4 */}
                   <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%]">
                      不错，订单 #9981 发货了吗？
                    </div>
                  </div>

                   {/* Message 5 */}
                   <div className="flex justify-start">
                    <div className="bg-stone-100 text-stone-800 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                      帮您查询了，订单 #9981 已于今天上午发货，预计后天送达。📦
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-stone-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">准备好体验未来的购物方式了吗？</h2>
          <p className="text-stone-400 mb-10 text-lg">点击右下角的对话气泡，开始与您的 AI 策展人互动。</p>
          <Link href="/products">
            <Button variant="outline" size="lg" className="rounded-full px-8 border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 hover:border-stone-600 transition-all">
              浏览画廊 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, example, color }: { icon: React.ReactNode, title: string, desc: string, example: string, color: string }) {
  return (
    <div className="group p-8 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 transform hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-500 leading-relaxed mb-6">{desc}</p>
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
        <div className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
          <MessageCircle className="w-3 h-3" /> 试着问:
        </div>
        <p className="text-sm font-medium text-stone-700 italic">{example}</p>
      </div>
    </div>
  )
}
