import { listMyChartVoByPageUsingPost } from '@/services/skye_VDMS_api/chartController';
import {Avatar, Card, List, message, Result} from 'antd';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {useModel} from "@umijs/max";
import Search from "antd/es/input/Search";

/**
 * 用户个人图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    // 默认第一页
    current: 1,
    // 每页数据量
    pageSize: 4,
    // 设置按照创建时间排序
    sortField: 'createTime',
    // 进行继续排序
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  // 全局获取用户信息
  const {initialState} = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  // 加载状态，控制页面是否加载完毕，默认正在加载
  const [loading, setLoading] = useState<boolean>(true);
  const loadData = async () => {
    // 正在获取数据，设置为加载中
    setLoading(true);
    try {
      const res = await listMyChartVoByPageUsingPost(searchParams);

      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 将图表的标题全部去掉
        if (res.data.records) {
          res.data.records.forEach(data => {
            // 要把后端返回的图表字符串改为对象数组,如果后端返回空字符串，就返回'{}'
            const chartOption = JSON.parse(data.genChart ?? '{}');
            // 把标题设为undefined
            chartOption.title = undefined;
            // 然后把修改后的数据转换为json设置回去
            data.genChart = JSON.stringify(chartOption);
          })
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败,' + e.message);
    }
    // 获取数据后，加载完毕，改为false
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (

    <div className="my-chart-page">

      {/* 搜索框*/}
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value) => {

          //设置搜索条件
          setSearchParams({
            // 原始条件
            ...initSearchParams,
            // 搜索条件
            name: value,
          })
        }}/>
      </div>
      <div className="margin-16"></div>
      <List
        /*
          栅格间隔16像素;xs屏幕<576px,栅格数1;
          sm屏幕≥576px，栅格数1;md屏幕≥768px,栅格数1;
          lg屏幕≥992px,栅格数2;xl屏幕≥1200px,栅格数2;
          xxl屏幕≥1600px,栅格数2
        */
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}

        // page表示当前页数，pageSize每页显示的数据条数
        pagination={{
          onChange: (page, pageSize) => {
            // 当切换分页时，在当前搜索条件的基础上，把页数调整为当前的页数
            setSearchParams({
              // 原始条件
              ...searchParams,
              // 搜索条件
              current: page,
              pageSize,
            })
          },
          // 当前页数
          current: searchParams.current,
          // 每页显示的数据条数
          pageSize: searchParams.pageSize,
          // 总数
          total: total,
        }}

        // 设置成自己的加载状态
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (

          <List.Item key={item.id}>
            <Card style={{width: '100%'}}>

              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAccount}/>}
                title={item.name}
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />

              <>
              {
                // 当状态（item.status）为'wait'时，显示待生成的结果组件
                item.status === 'wait' && <>
                  <Result
                    // 状态为警告
                    status="warning"
                    title="待生成"
                    // 子标题显示执行消息，如果执行消息为空，则显示'当前图表生成队列繁忙，请耐心等候'
                    subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                  />
                </>
              }
              {
                item.status === 'running' && <>
                  <Result
                    // 状态为信息
                    status="info"
                    title="图表生成中"
                    // 子标题显示执行消息
                    subTitle={item.execMessage}
                  />
                </>
              }
              {
                // 当状态（item.status）为'succeed'时，显示生成的图表
                item.status === 'succeed' && <>
                <div style={{marginBottom: 16}}/>
                <p>{'分析目标：' + item.goal}</p>
                <div style={{marginBottom: 16}}/>
                <ReactECharts option={JSON.parse(item.genChart ?? '{}')}/>
                </>
              }
              {
                // 当状态（item.status）为'failed'时，显示生成失败的结果组件
                item.status === 'failed' && <>
                  <Result
                    status="error"
                    title="图表生成失败"
                    subTitle={item.execMessage}
                  />
                </>
              }
              </>
            </Card>
          </List.Item>
        )}
      />
      总数：{total}
    </div>
  );
};
export default MyChartPage;
