import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, User, Link, Loader2, XCircle, Check, X, ListChecks, Linkedin, Mail, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Mock API functions (replace with actual API calls in a real application)
const fetchProductHuntPosts = async (category: string): Promise<any[]> => {
    // Simulate fetching and parsing Product Hunt RSS feed
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Mock data (replace with actual parsing logic)
    const mockData = Array.from({ length: 5 }, (_, i) => ({
        id: `${category}-${Date.now()}-${i}`,
        title: `Product ${i + 1} in ${category}`,
        description: `Description of Product ${i + 1}`,
        makerName: `Maker ${i + 1}`,
        makerUsername: `maker${i + 1}`,
        datePublished: new Date(Date.now() - i * 86400000).toISOString(), // Simulate different dates
        productHuntUrl: `https://www.producthunt.com/posts/${category}-product-${i + 1}`,
        makerEmail: `maker${i + 1}@example.com`, // Mock email
    }));
    return mockData;
};

const findLinkedInProfile = async (makerName: string): Promise<string | null> => {
    // Simulate finding LinkedIn profile (replace with actual API or search)
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    // Mock data:  50% chance of finding a profile
    if (Math.random() > 0.5) {
        return `https://www.linkedin.com/in/${makerName.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return null;
};

const sendToGoogleSheets = async (data: any): Promise<void> => {
    // Simulate sending data to Google Sheets
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    console.log('Sending to Google Sheets:', data);
    // In a real app, you would use a Google Sheets API here
};

const recordApproval = async (productId: string, makerName: string, linkedInProfile: string | null, decision: 'approved' | 'rejected') => {
    // Simulate recording approval/rejection
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`Record ${decision}: Product ID: ${productId}, Maker: ${makerName}, LinkedIn: ${linkedInProfile}`);
};

// --- Helper Components ---

const MakerCard = ({
    product,
    onApprove,
    onReject,
    isProcessing,
    decision
}: {
    product: any,
    onApprove: (product: any) => void,
    onReject: (product: any) => void,
    isProcessing: boolean,
    decision: 'approved' | 'rejected' | null
}) => {
    const [linkedInProfile, setLinkedInProfile] = useState<string | null>(null);
    const [isFindingProfile, setIsFindingProfile] = useState(false);
    const [profileFound, setProfileFound] = useState<boolean | null>(null); // null: not checked, true/false: checked
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
    });
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);

    const handleFindProfile = async () => {
        setIsFindingProfile(true);
        setProfileFound(null); // Reset
        const profile = await findLinkedInProfile(product.makerName);
        setLinkedInProfile(profile);
        setIsFindingProfile(false);
        setProfileFound(!!profile);
    };

    const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleSendEmail = async () => {
        setIsSending(true);
        setSendSuccess(null); // Reset
        // Simulate sending an email
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSending(false);
        // In a real app, handle success/failure
        if (Math.random() > 0.3) { // Simulate 70% success rate
            setSendSuccess(true);
            setContactForm({ subject: '', message: '' }); // Clear form
            setShowContactForm(false); // Close form
        } else {
            setSendSuccess(false);
        }
    };

    useEffect(() => {
        // Reset state when a new product is loaded
        setLinkedInProfile(null);
        setIsFindingProfile(false);
        setProfileFound(null);
        setShowContactForm(false);
        setContactForm({ subject: '', message: '' });
        setSendSuccess(null);
    }, [product.id]);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            <Card className={cn(
                "mb-4 transition-all duration-300",
                decision === 'approved' && "border-green-500 bg-green-500/10",
                decision === 'rejected' && "border-red-500 bg-red-500/10",
                "border"
            )}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-gray-500" />
                        <a
                            href={product.productHuntUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-blue-500 hover:text-blue-600"
                        >
                            {product.title}
                        </a>
                    </CardTitle>
                    <CardDescription>
                        {product.description} <br />
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" /> Published: {formatDate(product.datePublished)}
                        </span>
                    </CardDescription>

                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">Maker:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-gray-700">{product.makerName}</span>
                            <Badge variant="secondary" className="text-xs">
                                @{product.makerUsername}
                            </Badge>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-4 items-center">
                        {isFindingProfile ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Finding profile...</span>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleFindProfile}
                                disabled={isProcessing || profileFound !== null}
                                className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400 flex items-center gap-1"
                            >
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </Button>
                        )}
                        {profileFound !== null && (
                            <div className="mt-2 text-sm">
                                {profileFound ? (
                                    <a
                                        href={linkedInProfile!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:underline flex items-center gap-1"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Profile Found
                                    </a>
                                ) : (
                                    <span className="text-red-500 flex items-center gap-1">
                                        <XCircle className="w-4 h-4" />
                                        No profile found
                                    </span>
                                )}
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowContactForm(!showContactForm)}
                            className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 hover:text-purple-400 flex items-center gap-1"
                            disabled={isProcessing}
                        >
                            <Mail className="w-4 h-4" /> Contact Maker
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showContactForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4 p-4 bg-gray-100 rounded-md border border-gray-200"
                            >
                                <h4 className="font-semibold mb-2">Contact {product.makerName}</h4>
                                <Input
                                    type="text"
                                    name="subject"
                                    placeholder="Subject"
                                    value={contactForm.subject}
                                    onChange={handleContactFormChange}
                                    className="mb-2"
                                    disabled={isSending}
                                />
                                <Textarea
                                    name="message"
                                    placeholder="Message"
                                    value={contactForm.message}
                                    onChange={handleContactFormChange}
                                    className="mb-2"
                                    disabled={isSending}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowContactForm(false)}
                                        disabled={isSending}
                                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleSendEmail}
                                        disabled={isSending || !contactForm.subject.trim() || !contactForm.message.trim()}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        {isSending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...
                                            </>
                                        ) : (
                                            "Send"
                                        )}
                                    </Button>
                                </div>
                                {sendSuccess !== null && (
                                    <div className={cn(
                                        "mt-2 text-sm text-center",
                                        sendSuccess ? "text-green-600" : "text-red-600"
                                    )}>
                                        {sendSuccess ? "Message sent successfully!" : "Failed to send message."}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Separator className="my-4" />
                    <div className="flex gap-4">
                        <Button
                            variant="default"
                            className={cn(
                                "bg-green-500 hover:bg-green-600 text-white w-1/2",
                                isProcessing && "opacity-50 cursor-not-allowed",
                                decision === 'approved' && "opacity-70"
                            )}
                            onClick={() => onApprove(linkedInProfile ? { ...product, linkedInProfile } : product)}
                            disabled={isProcessing || decision === 'approved' || decision === 'rejected'}
                        >
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button
                            variant="destructive"
                            className={cn(
                                "bg-red-500 hover:bg-red-600 text-white w-1/2",
                                isProcessing && "opacity-50 cursor-not-allowed",
                                decision === 'rejected' && "opacity-70"
                            )}
                            onClick={() => onReject(product)}
                            disabled={isProcessing || decision === 'approved' || decision === 'rejected'}
                        >
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                    </div>
                    {decision && (
                        <div className="mt-4 text-sm font-medium text-center">
                            {decision === 'approved' ? (
                                <span className="text-green-600 flex items-center justify-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Approved
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center justify-center gap-1">
                                    <XCircle className="w-4 h-4" /> Rejected
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// --- Main Component ---

const ProductHuntApprover = () => {
    const [newMakers, setNewMakers] = useState<any[]>([]);
    const [approvedMakers, setApprovedMakers] = useState<any[]>([]);
    const [rejectedMakers, setRejectedMakers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingProduct, setProcessingProduct] = useState<string | null>(null); // Track the product being processed.
    const [categories, setCategories] = useState(['featured', 'tech', 'games']); // Example categories, make it stateful

    const fetchAndProcessPosts = useCallback(async (categories: string[]) => {
        setLoading(true);
        setError(null);
        try {
            let allNewMakers: any[] = [];
            for (const category of categories) {
                const posts = await fetchProductHuntPosts(category);
                allNewMakers = allNewMakers.concat(posts);
            }
            // Filter out any makers already approved or rejected
            const filteredMakers = allNewMakers.filter(maker =>
                !approvedMakers.find(approved => approved.id === maker.id) &&
                !rejectedMakers.find(rejected => rejected.id === maker.id)
            );

            setNewMakers(filteredMakers);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch Product Hunt posts.');
        } finally {
            setLoading(false);
        }
    }, [approvedMakers, rejectedMakers]);

    // Initial data load and set interval for fetching
    useEffect(() => {
        fetchAndProcessPosts(categories);

        const intervalId = setInterval(() => {
            fetchAndProcessPosts(categories);
        }, 3600000); // Check every hour (3600000 ms)

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchAndProcessPosts, categories]);

    const handleApproveMaker = async (product: any) => {
        setProcessingProduct(product.id); // Set the ID of the product being processed
        setNewMakers(newMakers.filter(maker => maker.id !== product.id)); // Remove immediately
        setApprovedMakers([...approvedMakers, { ...product, decision: 'approved' }]); // Optimistically add
        try {
            await sendToGoogleSheets(product); // Wait for the sheet update
            await recordApproval(product.id, product.makerName, product.linkedInProfile, 'approved');
        } catch (error: any) {
            setError(`Failed to approve maker: ${error.message || 'Unknown error'}`);
            // Rollback:  Remove from approved, add back to new
            setApprovedMakers(approvedMakers.filter((m) => m.id !== product.id));
            setNewMakers((prevMakers) => [...prevMakers, product]);
        } finally {
            setProcessingProduct(null);
        }
    };

    const handleRejectMaker = async (product: any) => {
        setProcessingProduct(product.id);
        setNewMakers(newMakers.filter(maker => maker.id !== product.id)); // Remove immediately
        setRejectedMakers([...rejectedMakers, { ...product, decision: 'rejected' }]);
        try {
            await recordApproval(product.id, product.makerName, null, 'rejected');
        } catch (error: any) {
            setError(`Failed to reject maker: ${error.message || 'Unknown error'}`);
            // Rollback: Remove from rejected, add back to new
            setRejectedMakers(rejectedMakers.filter((m) => m.id !== product.id));
            setNewMakers((prevMakers) => [...prevMakers, product]);
        } finally {
            setProcessingProduct(null);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Product Hunt Maker Approver</h1>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading new makers...</p>
                </div>
            ) : (
                <>
                    <Tabs defaultValue="new" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="new">New Makers</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                        <TabsContent value="new">
                            {newMakers.length === 0 && (
                                <div className="text-center mb-6">
                                    <ListChecks className="w-10 h-10 mx-auto mb-2 text-green-500" />
                                    <p className="text-gray-600">No new makers to review right now.</p>
                                </div>
                            )}
                            <AnimatePresence>
                                {newMakers.map(product => (
                                    <MakerCard
                                        key={product.id}
                                        product={product}
                                        onApprove={handleApproveMaker}
                                        onReject={handleRejectMaker}
                                        isProcessing={processingProduct === product.id}
                                        decision={null}
                                    />
                                ))}
                            </AnimatePresence>
                        </TabsContent>
                        <TabsContent value="approved">
                            {approvedMakers.length === 0 ? (
                                <p className="text-gray-500">No makers approved yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {approvedMakers.map((maker) => (
                                        <Card key={maker.id} className="bg-green-50/50 border-green-500/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    {maker.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    Maker: {maker.makerName} <br />
                                                    <span className="text-sm">
                                                        Approved on: {formatDate(maker.datePublished)}
                                                    </span>
                                                    {maker.linkedInProfile && (
                                                        <a
                                                            href={maker.linkedInProfile}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-blue-500 hover:underline flex items-center gap-1"
                                                        >
                                                            <Linkedin className="w-4 h-4" /> (LinkedIn)
                                                        </a>
                                                    )}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="rejected">
                            {rejectedMakers.length === 0 ? (
                                <p className="text-gray-500">No makers rejected yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {rejectedMakers.map((maker) => (
                                        <Card key={maker.id} className="bg-red-50/50 border-red-500/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                    {maker.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    Maker: {maker.makerName} <br />
                                                    <span className="text-sm">
                                                        Rejected on: {formatDate(maker.datePublished)}
                                                    </span>
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default ProductHuntApprover;
