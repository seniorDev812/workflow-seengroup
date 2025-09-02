import React from 'react';
import Image from 'next/image';
import { Card, Group, Badge, Text, Stack, Title } from '@mantine/core';
import { formatPrice, truncateText } from '@/lib/utils/productUtils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price?: string | number;
    imageUrl?: string;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      withBorder 
      radius="md" 
      p="md" 
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }),
      }}
      onClick={handleClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${product.name}` : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Product Image */}
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={140}
          style={{
            width: '100%',
            maxHeight: 140,
            objectFit: 'cover',
            borderRadius: 6,
            marginBottom: 8
          }}
        />
      ) : (
        <div 
          style={{
            width: '100%',
            height: 140,
            background: 'var(--mantine-color-dark-5)',
            borderRadius: 6,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mantine-color-dark-3)'
          }}
          aria-label="No product image available"
        >
          No Image
        </div>
      )}

      {/* Product Title and Price */}
      <Group justify="space-between" mb="xs" wrap="wrap" gap="xs">
        <Title order={4} style={{ flex: 1, minWidth: 0 }}>
          <Text 
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={product.name}
          >
            {product.name}
          </Text>
        </Title>
        {product.price && (
          <Badge variant="light" size="sm">
            ${formatPrice(product.price)}
          </Badge>
        )}
      </Group>

      {/* Product Details */}
      <Stack gap={4}>
        {product.description && (
          <Group gap={8} wrap="nowrap">
            <Text fw={600} size="sm" style={{ minWidth: 100 }}>Description</Text>
            <Text 
              size="sm" 
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={product.description}
            >
              {truncateText(product.description, 30)}
            </Text>
          </Group>
        )}
        {product.category && (
          <Group gap={8} wrap="nowrap">
            <Text fw={600} size="sm" style={{ minWidth: 100 }}>Category</Text>
            <Text 
              size="sm" 
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={product.category.name}
            >
              {product.category.name}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

