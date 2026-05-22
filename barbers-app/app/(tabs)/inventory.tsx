import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, FlatList } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/context/ThemeContext';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_qty: number;
}

export default function InventoryScreen() {
  const { theme, colors } = useAppTheme();
  const [viewMode, setViewMode] = useState<'scan' | 'list'>('scan');
  
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchBarbershop()
  }, [])

  useEffect(() => {
    if (viewMode === 'list' && barbershopId) {
      fetchAllProducts()
    }
  }, [viewMode, barbershopId])

  const fetchBarbershop = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: shop } = await supabase
      .from('barbershops')
      .select('id')
      .eq('owner_id', userData.user.id)
      .single()
    
    if (shop) setBarbershopId(shop.id)
  }

  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, sku, stock_qty')
        .eq('barbershop_id', barbershopId)
        .order('name');
        
      if (data) setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProducts(false);
    }
  }

  const handleBarcodeScanned = async ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    if (!barbershopId) {
      Alert.alert('Erro', 'Barbearia não encontrada.');
      return;
    }

    setLoadingAction(true);
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .eq('sku', data)
        .single();

      if (error || !product) {
        Alert.alert('Produto não encontrado', `O código ${data} não está cadastrado.`, [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      } else {
        setSelectedProduct(product as Product);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao buscar produto.');
      setScanned(false);
    } finally {
      setLoadingAction(false);
    }
  };

  const updateStock = async (amount: number) => {
    if (!selectedProduct) return;
    
    const newQty = Math.max(0, selectedProduct.stock_qty + amount);
    setLoadingAction(true);
    
    const { error } = await supabase
      .from('products')
      .update({ stock_qty: newQty })
      .eq('id', selectedProduct.id);

    setLoadingAction(false);

    if (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o estoque.');
    } else {
      setSelectedProduct({ ...selectedProduct, stock_qty: newQty });
      // Update local list if we are in list mode
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, stock_qty: newQty } : p));
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setScanned(false);
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <Text style={[styles.message, { color: colors.text }]}>O BarberSuite precisa da sua permissão para acessar a câmera e ler códigos de estoque.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {theme === 'dark' && (
        <LinearGradient colors={['#050505', '#111']} style={StyleSheet.absoluteFillObject} />
      )}

      {/* Toggles */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'scan' && { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} 
          onPress={() => setViewMode('scan')}
        >
          <Ionicons name="scan-outline" size={20} color={viewMode === 'scan' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.toggleText, { color: viewMode === 'scan' ? colors.primary : colors.textSecondary }]}>Escanear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} 
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list-outline" size={20} color={viewMode === 'list' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.toggleText, { color: viewMode === 'list' ? colors.primary : colors.textSecondary }]}>Inventário</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'scan' ? (
        <Animated.View entering={FadeIn} style={styles.contentArea}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Posicione o código de barras no centro</Text>
          
          <View style={[styles.cameraContainer, { borderColor: colors.border }]}>
            <CameraView 
              style={styles.camera} 
              facing={facing} 
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "pdf417", "aztec", "datamatrix"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            >
              <View style={styles.overlay}>
                <View style={styles.scanTarget} />
              </View>
            </CameraView>
          </View>
          
          {scanned && !selectedProduct && !loadingAction && (
            <TouchableOpacity style={[styles.rescanBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={() => setScanned(false)}>
              <Text style={[styles.rescanBtnText, { color: colors.text }]}>Escanear Novamente</Text>
            </TouchableOpacity>
          )}

          {loadingAction && !selectedProduct && (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={[styles.contentArea, { width: '100%' }]}>
          {loadingProducts ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Nenhum produto encontrado no estoque.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setSelectedProduct(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.productIcon, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                    <Ionicons name="cube-outline" size={24} color={colors.text} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.productSku, { color: colors.textSecondary }]}>SKU: {item.sku}</Text>
                  </View>
                  <View style={styles.productStock}>
                    <Text style={[styles.productStockLabel, { color: colors.textSecondary }]}>Qtd</Text>
                    <Text style={[styles.productStockValue, { color: colors.text }]}>{item.stock_qty}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      )}


      {/* MODAL DE PRODUTO */}
      <Modal
        visible={!!selectedProduct}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <BlurView intensity={theme === 'dark' ? 40 : 20} tint={theme === 'dark' ? "dark" : "light"} style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} activeOpacity={1} />
          
          <Animated.View entering={SlideInDown.springify().damping(20).stiffness(100)} style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedProduct && (
              <>
                <View style={[styles.modalDragIndicator, { backgroundColor: colors.border }]} />
                
                <View style={styles.modalHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                    <Ionicons name="cube-outline" size={40} color={colors.text} />
                  </View>
                  <Text style={[styles.modalName, { color: colors.text }]}>{selectedProduct.name}</Text>
                  <Text style={[styles.modalSku, { color: colors.textSecondary }]}>SKU: {selectedProduct.sku}</Text>
                </View>
                
                <View style={[styles.stockPanel, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                  <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Quantidade em Estoque</Text>
                  
                  <View style={styles.stockControls}>
                    <TouchableOpacity 
                      style={[styles.stockBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} 
                      onPress={() => updateStock(-1)}
                      disabled={loadingAction || selectedProduct.stock_qty <= 0}
                    >
                      <Ionicons name="remove" size={24} color={colors.text} />
                    </TouchableOpacity>
                    
                    <View style={styles.stockValueContainer}>
                      {loadingAction ? (
                        <ActivityIndicator color={colors.text} />
                      ) : (
                        <Text style={[styles.stockValue, { color: colors.text }]}>{selectedProduct.stock_qty}</Text>
                      )}
                    </View>

                    <TouchableOpacity 
                      style={[styles.stockBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} 
                      onPress={() => updateStock(1)}
                      disabled={loadingAction}
                    >
                      <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeBtn} 
                  onPress={closeModal}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ffffff', '#e0e0e0']}
                    style={styles.closeBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.closeBtnText}>Concluir / Fechar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
    width: '90%',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  toggleText: {
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  btnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  headerText: {
    marginBottom: 20,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  cameraContainer: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTarget: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  rescanBtn: {
    marginTop: 30,
    padding: 16,
    borderRadius: 8,
  },
  rescanBtnText: {
    fontWeight: 'bold',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
  },
  productStock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(150,150,150,0.2)',
  },
  productStockLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  productStockValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 400,
    borderTopWidth: 1,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  modalName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalSku: {
    fontSize: 14,
    marginTop: 8,
  },
  stockPanel: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
  },
  stockLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  stockBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockValueContainer: {
    width: 60,
    alignItems: 'center',
  },
  stockValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  closeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeBtnGradient: {
    padding: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
