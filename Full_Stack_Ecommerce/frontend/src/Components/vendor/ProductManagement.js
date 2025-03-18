import {
    Button,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Space,
    Switch,
    Table
} from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    // 获取商品列表
    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/products');
            console.log('获取到的商品数据：', response.data.data);
            setProducts(response.data.data);
        } catch (error) {
            console.error('获取商品列表失败：', error);
            message.error('获取商品列表失败');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 处理编辑商品
    const handleEdit = (product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsEditModalVisible(true);
    };

    // 处理保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await form.validateFields();
            await axios.put(`/api/products/${editingProduct.productID}`, values);
            message.success('商品信息更新成功');
            setIsEditModalVisible(false);
            fetchProducts();
        } catch (error) {
            message.error('更新商品信息失败');
        }
    };

    // 处理启用/禁用商品
    const handleToggleStatus = async (product) => {
        try {
            await axios.put(`/api/products/${product.productID}/status`, {
                available: !product.available
            });
            message.success(`商品已${product.available ? '禁用' : '启用'}`);
            fetchProducts();
        } catch (error) {
            message.error('更新商品状态失败');
        }
    };

    const columns = [
        {
            title: '商品ID',
            dataIndex: 'productID',
            key: 'productID',
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '价格',
            dataIndex: 'new_price',
            key: 'new_price',
            render: (price) => `¥${price}`,
        },
        {
            title: '状态',
            dataIndex: 'available',
            key: 'available',
            render: (available, record) => (
                <Switch
                    checked={available}
                    onChange={() => handleToggleStatus(record)}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>商品管理</h2>
            <Table columns={columns} dataSource={products} rowKey="productID" />

            <Modal
                title="编辑商品信息"
                open={isEditModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="商品名称"
                        rules={[{ required: true, message: '请输入商品名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="商品描述"
                        rules={[{ required: true, message: '请输入商品描述' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name="new_price"
                        label="价格"
                        rules={[{ required: true, message: '请输入商品价格' }]}
                    >
                        <InputNumber min={0} precision={2} />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="商品分类"
                        rules={[{ required: true, message: '请输入商品分类' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement; 