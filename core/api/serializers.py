from rest_framework import serializers
from core.models import Item, Order, OrderItem


class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value


class ItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'price',
            'discount_price',
            'category',
            'label',
            'slug',
            'description',
            'image'
        )

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()


class OrderItemSerializer(serializers.ModelSerializer):
    item = StringSerializer()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'item',
            'quantity'
        )


class OrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_items'
        )

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data
